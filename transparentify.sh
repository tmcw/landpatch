for f in samples/*.jpg
do
    convert $f -fuzz 10% -transparent black "${f%.jpg}.png"
done
