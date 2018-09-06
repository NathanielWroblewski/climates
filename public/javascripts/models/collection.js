namespace('App.Models')

class Collection {
  constructor ({ data }) {
    this.data = data
  }

  avgMin () {
    return this.format(({ avg_min }) => parseFloat(avg_min))
  }

  avgMax () {
    return this.format(({ avg_max }) => parseFloat(avg_max))
  }

  variance () {
    return this.format(({ variance }) => parseFloat(variance))
  }

  avgTemp () {
    return this.format(({ avg_temp }) => parseFloat(avg_temp))
  }

  comparison (template) {
    return this.data.reduce((memo, datum) => {
      const variance = parseFloat(datum.variance)
      const avgTemp = parseFloat(datum.avg_temp)
      const rainfall = parseInt(datum.precip, 10)

      const name = datum.name.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())
      const x = variance / 100
      const y = avgTemp / 10  // tenths of degC -> degC
      const z = rainfall / 10 // tenths of mm -> mm

      if (!x || !y || !z) {
        return memo
      }

      memo.x.push(x)
      memo.y.push(y)
      memo.z.push(z)
      memo.text.push(template({ x, y, z, label: `${name}, ${datum.state}` }))

      return memo
    }, { x: [], y: [], z: [], text: [] })
  }

  format (by) {
    return this.data.map(datum => {
      const { lat, long, state, name } = datum

      return {
        lat: parseFloat(lat),
        long: parseFloat(long),
        state,
        name,
        value: by(datum)
      }
    })
  }

  toJSON () {
    return this.data
  }
}

App.Models.Collection = Collection
