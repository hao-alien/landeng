/*
Package errors defines error types used across Lantern project.

  errors.ReportTo(myErrorReporter)
  ...
  if n, err := Foo(); err != nil {
    errors.Wrap(err).Report()
  }

Wrap() method will try as much as possible to extract details from the error
passed in, if it's errors defined in Go standard library. For application
defined error type, at least the Go type name and what err.Error() returns
will be recorded.

Extra fields can be chained in any order, at any time.

  func Foo() *Error {
  	//...
    return errors.New("some error").With("some_counter", 1).WithOp("connect")
  }
  ...
  if err := Foo(); err != nil {
	err.UserAgent("Mozilla/5.0...").With("proxy_all", true).Report()
  }

If you want additional logging, call WithLogging(true) during program bootstrapping. If that flag is set, Report() will get a logger using golog.LoggerFor("<package-name-in-which-the-error-is-created">) and call its Error() method.

It's the caller's responsibility to avoid race condition accessing same error instance from multiple goroutines.
*/
package errors

import (
	"bufio"
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/textproto"
	"net/url"
	"os"
	"os/exec"
	"reflect"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"github.com/getlantern/golog"
	"github.com/getlantern/jibber_jabber"
	"github.com/getlantern/osversion"
	"github.com/getlantern/stack"
)

var (
	defaultSystemInfo *systemInfo
	currentReporter   Reporter = &StdReporter{}
	logging                    = false
)

func init() {
	osVersion, _ := osversion.GetHumanReadable()
	defaultSystemInfo = &systemInfo{
		OSType:    runtime.GOOS,
		OSArch:    runtime.GOARCH,
		OSVersion: osVersion,
		GoVersion: runtime.Version(),
		//TODO: app vesion is also required. As a low level library, we need it to be initialized by caller.
	}
}

type Reporter interface {
	Report(*Error)
}

type StdReporter struct{}

func (l StdReporter) Report(e *Error) {
	fmt.Printf("%+v", e.Error())
}

func ReportTo(r Reporter) {
	currentReporter = r
}

func WithLogging(b bool) {
	logging = b
}

func New(s string) (e *Error) {
	e = &Error{
		GoType: "errors.Error",
		Desc:   s,
	}
	e.attachStack(2)
	return
}

func Wrap(err error) (e *Error) {
	return WrapSkipFrame(err, 1)
}

func WrapSkipFrame(err error, skip int) (e *Error) {
	if e, ok := err.(*Error); ok {
		return e
	}
	e = &Error{Source: err}
	// always skip [WrapSkipFrame, attachStack]
	e.attachStack(skip + 2)
	e.applyDefaults()
	return
}

// Error wraps system and application errors in unified structure
type Error struct {
	// Source captures the underlying error that's wrapped by this Error
	Source  error           `json:"-"`
	Stack   stack.CallStack `json:"-"`
	Package string          `json:"package"` // lantern
	Func    string          `json:"func"`    // foo.Bar
	// FileLine is the file path relative to GOPATH together with the line when
	// Error is created.
	FileLine string `json:"file_line"` // github.com/lantern/foo.go:10
	// ReportFileLine is the file and line where the error is reported
	ReportFileLine string `json:"report_file_line"`
	// Go type name or constant/variable name of the error
	GoType string `json:"type"`
	// Error description, by either Go library or application
	Desc string `json:"desc"`
	// The operation which triggers the error to happen
	Op string `json:"operation,omitempty"`
	// Any extra fields
	Extra map[string]string `json:"extra,omitempty"`

	*ProxyingInfo
	*UserLocale
	*UserAgentInfo
}

func (e *Error) Report() {
	caller := stack.Caller(1)
	e.ReportFileLine = fmt.Sprintf("%+v", caller)
	currentReporter.Report(e)
	if logging {
		var pkg = fmt.Sprintf("%k", caller)
		golog.LoggerFor(pkg).Error(e.Error())
	}
}

func (e *Error) WithOp(op string) *Error {
	e.Op = op
	return e
}

func (e *Error) ProxyType(v ProxyType) *Error {
	if e.ProxyingInfo == nil {
		e.ProxyingInfo = &ProxyingInfo{}
	}
	e.ProxyingInfo.ProxyType = v
	return e
}

func (e *Error) ProxyLocalAddr(v string) *Error {
	if e.ProxyingInfo == nil {
		e.ProxyingInfo = &ProxyingInfo{}
	}
	e.ProxyingInfo.LocalAddr = v
	return e
}

func (e *Error) ProxyAddr(v string) *Error {
	if e.ProxyingInfo == nil {
		e.ProxyingInfo = &ProxyingInfo{}
	}
	e.ProxyingInfo.ProxyAddr = v
	return e
}

func (e *Error) ProxyDatacenter(v string) *Error {
	if e.ProxyingInfo == nil {
		e.ProxyingInfo = &ProxyingInfo{}
	}
	e.ProxyingInfo.Datacenter = v
	return e
}

func (e *Error) ProxyOriginSite(v string) *Error {
	if e.ProxyingInfo == nil {
		e.ProxyingInfo = &ProxyingInfo{}
	}
	e.ProxyingInfo.OriginSite = v
	return e
}

func (e *Error) URIScheme(v string) *Error {
	if e.ProxyingInfo == nil {
		e.ProxyingInfo = &ProxyingInfo{}
	}
	e.ProxyingInfo.URIScheme = v
	return e
}

func (e *Error) UserAgent(v string) *Error {
	if e.UserAgentInfo == nil {
		e.UserAgentInfo = &UserAgentInfo{}
	}
	e.UserAgentInfo.UserAgent = v
	return e
}

func (e *Error) WithUserLocale() *Error {
	lang, _ := jibber_jabber.DetectLanguage()
	country, _ := jibber_jabber.DetectTerritory()
	e.UserLocale = &UserLocale{
		time.Now().Format("MST"),
		lang,
		country,
	}
	return e
}

// With attaches arbitrary field to the error. key will be normalized as underscore_divided_words, so dashes, dots and spaces will all be replaced with underscores, and all characters will be lowercased.
// TODO: normalize key
func (e *Error) With(key string, value interface{}) *Error {
	if e.Extra == nil {
		e.Extra = make(map[string]string)
	}
	switch actual := value.(type) {
	case string:
		e.Extra[key] = actual
	case int:
		e.Extra[key] = strconv.Itoa(actual)
	case bool:
		e.Extra[key] = strconv.FormatBool(actual)
	default:
		e.Extra[key] = fmt.Sprint(value)
	}
	return e
}

func (e *Error) Error() string {
	var buf bytes.Buffer
	e.writeTo(&buf)
	return buf.String()
}

func (e *Error) writeTo(w io.Writer) {
	_, _ = io.WriteString(w, e.Desc)
	if e.Package != "" {
		_, _ = io.WriteString(w, " Package="+e.Package)
	}
	if e.Func != "" {
		_, _ = io.WriteString(w, " Func="+e.Func)
	}
	if e.GoType != "" {
		_, _ = io.WriteString(w, " GoType="+e.GoType)
	}
	if e.Op != "" {
		_, _ = io.WriteString(w, " Op="+e.Op)
	}
	if e.Desc != "" {
		_, _ = io.WriteString(w, " Desc="+e.Desc)
	}
	if e.ProxyingInfo != nil {
		_, _ = io.WriteString(w, e.ProxyingInfo.String())
	}
	if e.UserLocale != nil {
		_, _ = io.WriteString(w, e.UserLocale.String())
	}
	if e.UserAgentInfo != nil {
		_, _ = io.WriteString(w, e.UserAgentInfo.String())
	}
	for k, v := range e.Extra {
		_, _ = io.WriteString(w, " "+k+"="+v)
	}
}

func (e *Error) attachStack(skip int) {
	caller := stack.Caller(skip)
	e.Package = fmt.Sprintf("%k", caller)
	e.Func = fmt.Sprintf("%n", caller)
	e.FileLine = fmt.Sprintf("%+v", caller)
	e.Stack = stack.Trace().TrimBelow(caller).TrimRuntime()
}

func (e *Error) applyDefaults() {
	if e.Source != nil {
		op, goType, desc, extra := parseError(e.Source)
		if e.Op == "" {
			e.Op = op
		}
		if e.GoType == "" {
			e.GoType = goType
		}
		if e.Desc == "" {
			e.Desc = desc
		}
		if e.Extra == nil {
			e.Extra = extra
		} else {
			for key, value := range extra {
				_, found := e.Extra[key]
				if !found {
					e.Extra[key] = value
				}
			}
		}
	}
}

type systemInfo struct {
	OSType    string `json:"os_type"`
	OSVersion string `json:"os_version"`
	OSArch    string `json:"os_arch"`
	GoVersion string `json:"go_version"`
}

func (si *systemInfo) String() string {
	var buf bytes.Buffer
	if si.OSType != "" {
		_, _ = buf.WriteString(" OSType=" + si.OSType)
	}
	if si.OSVersion != "" {
		_, _ = buf.WriteString(" OSVersion=\"" + si.OSVersion + "\"")
	}
	if si.OSArch != "" {
		_, _ = buf.WriteString(" OSArch=" + si.OSArch)
	}
	if si.GoVersion != "" {
		_, _ = buf.WriteString(" GoVersion=\"" + si.GoVersion + "\"")
	}
	return buf.String()
}

type UserLocale struct {
	TimeZone string `json:"time_zone,omitempty"`
	Language string `json:"language,omitempty"`
	Country  string `json:"country,omitempty"`
}

func (si *UserLocale) String() string {
	var buf bytes.Buffer
	if si.TimeZone != "" {
		_, _ = buf.WriteString(" TimeZone=" + si.TimeZone)
	}
	if si.Language != "" {
		_, _ = buf.WriteString(" Language=" + si.Language)
	}
	if si.Country != "" {
		_, _ = buf.WriteString(" Country=" + si.Country)
	}
	return buf.String()
}

// ProxyType is the type of various proxy channel
type ProxyType string

const (
	// direct access, not proxying at all
	NoProxy ProxyType = "no_proxy"
	// access through Lantern hosted chained server
	ChainedProxy ProxyType = "chained"
	// access through domain fronting
	FrontedProxy ProxyType = "fronted"
	// access through direct domain fronting
	DirectFrontedProxy ProxyType = "DDF"
)

// ProxyingInfo encapsulates fields to describe an access through a proxy channel.
type ProxyingInfo struct {
	ProxyType  ProxyType `json:"proxy_type,omitempty"`
	LocalAddr  string    `json:"local_addr,omitempty"`
	ProxyAddr  string    `json:"proxy_addr,omitempty"`
	Datacenter string    `json:"proxy_datacenter,omitempty"`
	OriginSite string    `json:"origin_site,omitempty"`
	URIScheme  string    `json:"uri_scheme,omitempty"`
}

func (pi *ProxyingInfo) String() string {
	var buf bytes.Buffer
	if pi.ProxyType != "" {
		_, _ = buf.WriteString(" ProxyType=" + string(pi.ProxyType))
	}
	if pi.LocalAddr != "" {
		_, _ = buf.WriteString(" LocalAddr=" + pi.LocalAddr)
	}
	if pi.ProxyAddr != "" {
		_, _ = buf.WriteString(" ProxyAddr=" + pi.ProxyAddr)
	}
	if pi.Datacenter != "" {
		_, _ = buf.WriteString(" Datacenter=" + pi.Datacenter)
	}
	if pi.OriginSite != "" {
		_, _ = buf.WriteString(" OriginSite=" + pi.OriginSite)
	}
	if pi.URIScheme != "" {
		_, _ = buf.WriteString(" URIScheme=" + pi.URIScheme)
	}
	return buf.String()
}

// UserAgentInfo encapsulates traits of the browsers or 3rd party applications
// directing traffic through Lantern.
type UserAgentInfo struct {
	UserAgent string `json:"user_agent,omitempty"`
}

func (ul *UserAgentInfo) String() string {
	return fmt.Sprintf("UserAgent=%s", ul.UserAgent)
}

func parseError(err error) (op string, goType string, desc string, extra map[string]string) {
	extra = make(map[string]string)

	// interfaces
	if _, ok := err.(net.Error); ok {
		if opError, ok := err.(*net.OpError); ok {
			op = opError.Op
			if opError.Source != nil {
				extra["local_addr"] = opError.Source.String()
			}
			if opError.Addr != nil {
				extra["remote_addr"] = opError.Addr.String()
			}
			extra["network"] = opError.Net
			err = opError.Err
		}
		switch actual := err.(type) {
		case *net.AddrError:
			goType = "net.AddrError"
			desc = actual.Err
			extra["addr"] = actual.Addr
		case *net.DNSError:
			goType = "net.DNSError"
			desc = actual.Err
			extra["domain"] = actual.Name
			if actual.Server != "" {
				extra["dns_server"] = actual.Server
			}
		case *net.InvalidAddrError:
			goType = "net.InvalidAddrError"
			desc = actual.Error()
		case *net.ParseError:
			goType = "net.ParseError"
			desc = "invalid " + actual.Type
			extra["text_to_parse"] = actual.Text
		case net.UnknownNetworkError:
			goType = "net.UnknownNetworkError"
			desc = "unknown network"
		case syscall.Errno:
			goType = "syscall.Errno"
			desc = actual.Error()
		case *url.Error:
			goType = "url.Error"
			desc = actual.Err.Error()
			op = actual.Op
		default:
			goType = reflect.TypeOf(err).String()
			desc = err.Error()
		}
		return
	}
	if _, ok := err.(runtime.Error); ok {
		desc = err.Error()
		switch err.(type) {
		case *runtime.TypeAssertionError:
			goType = "runtime.TypeAssertionError"
		default:
			goType = reflect.TypeOf(err).String()
		}
		return
	}

	// structs
	switch actual := err.(type) {
	case *http.ProtocolError:
		desc = actual.ErrorString
		if name, ok := httpProtocolErrors[err]; ok {
			goType = name
		} else {
			goType = "http.ProtocolError"
		}
	case url.EscapeError, *url.EscapeError:
		goType = "url.EscapeError"
		desc = "invalid URL escape"
	case url.InvalidHostError, *url.InvalidHostError:
		goType = "url.InvalidHostError"
		desc = "invalid character in host name"
	case *textproto.Error:
		goType = "textproto.Error"
		desc = actual.Error()
	case textproto.ProtocolError, *textproto.ProtocolError:
		goType = "textproto.ProtocolError"
		desc = actual.Error()

	case tls.RecordHeaderError:
		goType = "tls.RecordHeaderError"
		desc = actual.Msg
		extra["header"] = hex.EncodeToString(actual.RecordHeader[:])
	case x509.CertificateInvalidError:
		goType = "x509.CertificateInvalidError"
		desc = actual.Error()
	case x509.ConstraintViolationError:
		goType = "x509.ConstraintViolationError"
		desc = actual.Error()
	case x509.HostnameError:
		goType = "x509.HostnameError"
		desc = actual.Error()
		extra["host"] = actual.Host
	case x509.InsecureAlgorithmError:
		goType = "x509.InsecureAlgorithmError"
		desc = actual.Error()
	case x509.SystemRootsError:
		goType = "x509.SystemRootsError"
		desc = actual.Error()
	case x509.UnhandledCriticalExtension:
		goType = "x509.UnhandledCriticalExtension"
		desc = actual.Error()
	case x509.UnknownAuthorityError:
		goType = "x509.UnknownAuthorityError"
		desc = actual.Error()
	case hex.InvalidByteError:
		goType = "hex.InvalidByteError"
		desc = "invalid byte"
	case *json.InvalidUTF8Error:
		goType = "json.InvalidUTF8Error"
		desc = "invalid UTF-8 in string"
	case *json.InvalidUnmarshalError:
		goType = "json.InvalidUnmarshalError"
		desc = actual.Error()
	case *json.MarshalerError:
		goType = "json.MarshalerError"
		desc = actual.Error()
	case *json.SyntaxError:
		goType = "json.SyntaxError"
		desc = actual.Error()
	case *json.UnmarshalFieldError:
		goType = "json.UnmarshalFieldError"
		desc = actual.Error()
	case *json.UnmarshalTypeError:
		goType = "json.UnmarshalTypeError"
		desc = actual.Error()
	case *json.UnsupportedTypeError:
		goType = "json.UnsupportedTypeError"
		desc = actual.Error()
	case *json.UnsupportedValueError:
		goType = "json.UnsupportedValueError"
		desc = actual.Error()

	case *os.LinkError:
		goType = "os.LinkError"
		desc = actual.Error()
	case *os.PathError:
		goType = "os.PathError"
		op = actual.Op
		desc = actual.Err.Error()
	case *os.SyscallError:
		goType = "os.SyscallError"
		op = actual.Syscall
		desc = actual.Err.Error()
	case *exec.Error:
		goType = "exec.Error"
		desc = actual.Err.Error()
	case *exec.ExitError:
		goType = "exec.ExitError"
		desc = actual.Error()
		// TODO: limit the length
		extra["stderr"] = string(actual.Stderr)
	case *strconv.NumError:
		goType = "strconv.NumError"
		desc = actual.Err.Error()
		extra["function"] = actual.Func
	case *time.ParseError:
		goType = "time.ParseError"
		desc = actual.Message
	default:
		desc = err.Error()
		if t, ok := miscErrors[err]; ok {
			goType = t
			return
		}
		goType = reflect.TypeOf(err).String()
	}
	return
}

var httpProtocolErrors = map[error]string{
	http.ErrHeaderTooLong:        "http.ErrHeaderTooLong",
	http.ErrShortBody:            "http.ErrShortBody",
	http.ErrNotSupported:         "http.ErrNotSupported",
	http.ErrUnexpectedTrailer:    "http.ErrUnexpectedTrailer",
	http.ErrMissingContentLength: "http.ErrMissingContentLength",
	http.ErrNotMultipart:         "http.ErrNotMultipart",
	http.ErrMissingBoundary:      "http.ErrMissingBoundary",
}

var miscErrors = map[error]string{
	bufio.ErrInvalidUnreadByte: "bufio.ErrInvalidUnreadByte",
	bufio.ErrInvalidUnreadRune: "bufio.ErrInvalidUnreadRune",
	bufio.ErrBufferFull:        "bufio.ErrBufferFull",
	bufio.ErrNegativeCount:     "bufio.ErrNegativeCount",
	bufio.ErrTooLong:           "bufio.ErrTooLong",
	bufio.ErrNegativeAdvance:   "bufio.ErrNegativeAdvance",
	bufio.ErrAdvanceTooFar:     "bufio.ErrAdvanceTooFar",
	bufio.ErrFinalToken:        "bufio.ErrFinalToken",

	http.ErrWriteAfterFlush:    "http.ErrWriteAfterFlush",
	http.ErrBodyNotAllowed:     "http.ErrBodyNotAllowed",
	http.ErrHijacked:           "http.ErrHijacked",
	http.ErrContentLength:      "http.ErrContentLength",
	http.ErrBodyReadAfterClose: "http.ErrBodyReadAfterClose",
	http.ErrHandlerTimeout:     "http.ErrHandlerTimeout",
	http.ErrLineTooLong:        "http.ErrLineTooLong",
	http.ErrMissingFile:        "http.ErrMissingFile",
	http.ErrNoCookie:           "http.ErrNoCookie",
	http.ErrNoLocation:         "http.ErrNoLocation",
	http.ErrSkipAltProtocol:    "http.ErrSkipAltProtocol",

	io.EOF:              "io.EOF",
	io.ErrClosedPipe:    "io.ErrClosedPipe",
	io.ErrNoProgress:    "io.ErrNoProgress",
	io.ErrShortBuffer:   "io.ErrShortBuffer",
	io.ErrShortWrite:    "io.ErrShortWrite",
	io.ErrUnexpectedEOF: "io.ErrUnexpectedEOF",

	os.ErrInvalid:    "os.ErrInvalid",
	os.ErrPermission: "os.ErrPermission",
	os.ErrExist:      "os.ErrExist",
	os.ErrNotExist:   "os.ErrNotExist",

	exec.ErrNotFound: "exec.ErrNotFound",

	x509.ErrUnsupportedAlgorithm: "x509.ErrUnsupportedAlgorithm",
	x509.IncorrectPasswordError:  "x509.IncorrectPasswordError",

	hex.ErrLength: "hex.ErrLength",
}
