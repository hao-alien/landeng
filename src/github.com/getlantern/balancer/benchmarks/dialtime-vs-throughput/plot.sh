#!/usr/bin/env sh

declare -a names=("DialTime" "Throughput")
declare -a sizes=("small" "medium" "large")

mkdir -p png

# draw graph for each server
for file in *.csv; do
  server=`echo $file | cut -d "_" -f 2 | cut -d ":" -f 1`
  cp gnuplot.script  gnuplot.script.$server
  echo "set multiplot layout 3,2 rowsfirst title '$server'" >> gnuplot.script.$server
  for size in "${sizes[@]}"; do
    grep $size $file > $file.$size
    echo "set title '$server ${names[0]} with $size payload'" >> gnuplot.script.$server
    echo "set ylabel 'ms'" >> gnuplot.script.$server
    echo "plot '$file.$size' using 2:4 with l notitle" >> gnuplot.script.$server

    echo "set title '$server ${names[1]} with $size payload'" >> gnuplot.script.$server
    echo "set ylabel 'Bps'" >> gnuplot.script.$server
    echo "plot '$file.$size' using 2:9 with l notitle" >> gnuplot.script.$server
  done
  gnuplot gnuplot.script.$server > png/$server.png
done


# draw overall graph
script=gnuplot.script.overall
cp gnuplot.script $script
echo "set multiplot layout 3,2 rowsfirst title 'Overall'" >> $script

for size in "${sizes[@]}"; do
  line1="plot "
  line2="plot "
  for file in *.csv; do
    grep $size $file > $file.$size
    server=`echo $file | cut -d "_" -f 2 | cut -d ":" -f 1`
    line1+=" '$file.$size' using 2:4 title '$server' with l,"
    line2+=" '$file.$size' using 2:9 title '$server' with l,"
  done

  echo "set title '${names[0]} with $size paylod'" >> $script
  echo "set ylabel 'ms'" >> $script
  echo "$line1" >> $script

  echo "set title '${names[1]} with $size paylod'" >> $script
  echo "set ylabel 'Bps'" >> $script
  echo "$line2" >> $script
done
gnuplot $script > png/overall.png

for size in "${sizes[@]}"; do
  rm *.$size
done
rm gnuplot.script.*
