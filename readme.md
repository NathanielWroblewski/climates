Visualizing Climates
===

Observations from the conterminous United States for the year 2017

![Screenshot](https://raw.githubusercontent.com/NathanielWroblewski/climates/master/screenshot.png)

Running locally
---

On a Mac,

```sh
$ git clone https://github.com/NathanielWroblewski/climates.git
$ cd climates
$ open http://localhost:8000 && python -m SimpleHTTPServer
```

Datasets
---

I'm using `lrzip` to compress large datasets:
```
$ brew install lrzip
$ lrztar -z ./data/2017.csv
$ lrzuntar ./data/2017.csv.tar.lrz
```

TODO
---

  - Add tooltip to map
