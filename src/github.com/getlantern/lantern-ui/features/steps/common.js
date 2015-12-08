var steps = function() {

  this.Given(/^Lantern is running$/, function () {
    browser.get('/');
  });

  this.Given(/^I am a Pro user$/, function (done) {
    // Write code here that turns the phrase above into concrete actions
    done.pending();
  });

};

module.exports = steps;
