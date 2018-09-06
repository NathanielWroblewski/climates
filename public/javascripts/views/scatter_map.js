namespace('App.Views')

class ScatterMap {
  constructor ({ element, data, format }) {
    this.element = element
    this.context = this.element.getContext('2d')
    this.width = this.element.width
    this.height = this.element.height
    this.pointRadius = 2

    this.setData(data, format)
    this.setListeners()
  }

  setListeners () {
    this.element.addEventListener('mousemove', e => this.handleMousemove(e))
  }

  handleMousemove ({ clientX, clientY }) {
    const point = this.data.find(({ x, y }) => x === clientX && y === clientY)

    if (point) {
      this.context.fillStyle = '#666666'
      this.context.font = '16px sans-serif'
      this.context.textAlign = 'right'
      this.context.fillText(point.name, this.width, this.height)
    }
  }

  setData (data, format) {
    this.data = data.map(({ lat, long, value }) => {
      const [x, y] = this.mercatorize([lat, long])

      return { x, y, value }
    })
    this.format = format
    this.domain = this.extent(this.data.map(({ x }) => x))
    this.range = this.extent(this.data.map(({ y }) => y))
    this.minmax = this.extent(this.data.map(({ value }) => value))
  }

  extent (data) {
    return [
      data.reduce((memo, value) => value < memo ? value : memo, Infinity),
      data.reduce((memo, value) => value > memo ? value : memo, -Infinity)
    ]
  }

  mercatorize ([lat, long]) {
    const x = (long + 180) * (this.width / 360)
    const radians = lat * Math.PI / 180
    const mercatorN = Math.log10(Math.tan(Math.PI / 4) + (radians / 2))
    const y = (this.height / 2) - this.height * mercatorN / (2 * Math.PI)

    return [x, y]
  }

  scale ([x, y]) {
    const [xmin, xmax] = this.domain
    const [ymin, ymax] = this.range
    const yoffset = 50

    return [
      (x - xmin) * ((this.width - (this.pointRadius * 2)) / (xmax - xmin)) + this.pointRadius,
      (y - ymin) * ((this.height - yoffset - (this.pointRadius * 2)) / (ymax - ymin)) + this.pointRadius
    ]
  }

  cividisize (value) {
    const { CIVIDIS } = App.Constants
    const [min, max] = this.minmax
    const index = Math.floor((value - min) * (CIVIDIS.length / (max - min)))

    return CIVIDIS[index]
  }

  clear () {
    this.context.clearRect(0, 0, this.element.width, this.element.height)
  }

  draw () {
    this.drawData()
    this.drawLegend()
    this.drawHistogram()
  }

  drawData () {
    const tau = Math.PI * 2

    this.data.forEach(({ x, y, value }) => {
      const [scaledX, scaledY] = this.scale([x, y])

      this.context.fillStyle = this.cividisize(value)
      this.context.beginPath()
      this.context.arc(scaledX, scaledY, this.pointRadius, 0, tau)
      this.context.fill()
    })
  }

  drawLegend () {
    const { CIVIDIS } = App.Constants
    const [min, max] = this.minmax

    CIVIDIS.forEach((color, index) => {
      this.context.fillStyle = color
      this.context.fillRect(index, this.height - 30, 1, 10)
    })

    this.context.fillStyle = '#666666'
    this.context.font = '16px sans-serif'
    this.context.textAlign = 'left'
    this.context.fillText(this.format(Math.floor(min)), 0, this.height)
    this.context.textAlign = 'right'
    this.context.fillText(this.format(Math.ceil(max)), CIVIDIS.length, this.height)
  }

  drawHistogram () {
    const { CIVIDIS } = App.Constants
    const [min, max] = this.minmax
    const histogram = this.data.reduce((memo, { value }) => {
      const index = Math.floor((value - min) * (CIVIDIS.length / (max - min)))
      memo[index]++

      return memo
    }, new Array(CIVIDIS.length).fill(0))

    histogram.forEach((count, index) => {
      this.context.fillStyle = CIVIDIS[index]
      this.context.fillRect(index, this.height - 32, 1, -count)
    })
  }

  render () {
    this.clear()
    this.draw()
  }
}

App.Views.ScatterMap = ScatterMap
