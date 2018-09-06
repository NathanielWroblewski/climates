namespace('App.Views')

const DATA = {
  opacity: 0.4,
  type: 'scatter3d',
  hoverinfo: 'text',
  mode: 'markers',
  marker: {
    color: '#2574a9',
    size: 2,
    line: {
      color: '#336e7b',
      width: 2
    }
  }
}

const LAYOUT = {
  hovermode: 'closest',
  width: 800,
  margin: { r: 0, l: 0, b: 0, t: 0 },
  paper_bgcolor: '#fffff8',
  hoverlabel: {
    bgcolor: '#fffff8',
    bordercolor: '#111',
    font: {
      color: '#111',
      family: 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif',
      familysrc: '/public/et-book/et-book-roman-line-figures/et-book-roman-line-figures.svg#etbookromanosf',
      size: 16,
    }
  }
}

const SCENE = {
  aspectmode: 'manual',
  aspectratio: {
    x: 1, y: 1, z: 1,
  },
  camera: {
    up: { x: 0, y: 0, z: 0 },
    center: { x: 0, y: 0, z: 0 },
    eye: { x: 1, y: 1, z: 1.3 },
  }
}

const AXIS = {
  nticks: 7,
  tickfont: {
    color: '#aaa',
    family: 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif',
    familysrc: '/public/et-book/et-book-roman-line-figures/et-book-roman-line-figures.svg#etbookromanosf',
    size: 12,
  },
  showspikes: false,
  showbackground: false,
  gridcolor: '#aaa',
  zerolinecolor: '#aaa',
  hoverformat: '.2f',
  titlefont: {
    color: '#111',
    family: 'et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif',
    familysrc: '/public/et-book/et-book-roman-line-figures/et-book-roman-line-figures.svg#etbookromanosf',
    size: 16,
  }
}

const tooltipTemplate = ({ x, y, z, label }) => `
  <br>
  <b>${label}</b>  <br>
  <i>variance</i>: ${x.toFixed(2)}  <br>
  <i>avg temp</i>: ${y.toFixed(2)} &deg;C  <br>
  <i>rainfall</i>: ${parseInt(z, 10)} mm
  <br>
`

class ScatterPlot {
  constructor ({ element, model }) {
    this.element = element
    this.model = model
  }

  render () {
    const data = this.model.comparison(tooltipTemplate)

    this.element.innerHTML = ''
    window.Plotly.newPlot(this.element, [{ ...data, ...DATA }], {
      ...LAYOUT,
      scene: {
        ...SCENE,
        xaxis: {
          ...AXIS,
          range: [Math.min(...data.x), Math.max(...data.x)],
          title: 'Variance',
        },
        yaxis: {
          ...AXIS,
          range: [Math.min(...data.y), Math.max(...data.y)],
          title: 'Tavg (&deg;C)',
        },
        zaxis: {
          ...AXIS,
          range: [Math.min(...data.z), Math.max(...data.z)],
          title: 'Rainfall (mm)',
        },
      },
    })
  }
}

App.Views.ScatterPlot = ScatterPlot
