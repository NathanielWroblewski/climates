namespace('App.Views')

const COLUMNS = [
  {
    key: 'station',
    label: 'Station',
    render: ({ name }) => name.toLowerCase()
  },
  {
    key: 'state',
    label: 'State',
    render: ({ state }) => state.toUpperCase()
  },
  {
    key: 'avg',
    label: 'T<sub>avg</sub> (&degC)',
    render: ({ avg_temp }) => (avg_temp / 10).toFixed(2)
  },
  {
    key: 'avg_min',
    label: 'T<sub>min</sub> (&degC)',
    render: ({ avg_min }) => (avg_min / 10).toFixed(2)
  },
  {
    key: 'avg_max',
    label: 'T<sub>max</sub> (&degC)',
    render: ({ avg_max }) => (avg_max / 10).toFixed(2)
  },
  {
    key: 'variance',
    label: 'Variance',
    render: ({ variance }) => (variance / 100).toFixed(2)
  },
  {
    key: 'precip',
    label: 'Precip (mm)',
    render: ({ precip }) => (precip / 10).toFixed(2)
  }
]

// Array#sort is unstable
const stableSort = (array, compare) => {
  const list = array.map((value, index) => ({ value, index }))

  list.sort((a, b) => {
    const r = compare(a.value, b.value)

    return r == 0 ? a.index - b.index : r
  })

  return list.map(element => element.value)
}

const ASC = 1;
const DESC = -1;

const textCompare = (a, b) => (
  a.localeCompare(b, 'en', {
    ignorePunctuation: true,
    caseFirst: 'false',
    numeric: false,
    sensitivity: 'variant',
    usage: 'sort'
  })
)

const numCompare = (a = 0, b = 0) => {
  if (a === b) return 0

  return a > b ? 1 : -1
}

const COMPARATORS = {
  station: (a, b) => textCompare(a.name, b.name),
  state: (a, b) => textCompare(a.state, b.state),
  // latitude: (a, b) => numCompare(a.latitude || 0, b.latitude || 0),
  // longitude: (a, b) => numCompare(a.longitude || 0, b.longitude || 0),
  min: (a, b) => numCompare(a.min || 0, b.min || 0),
  max: (a, b) => numCompare(a.max || 0, b.max || 0),
  avg: (a, b) => numCompare(a.avg || 0, b.avg || 0),
  avg_min: (a, b) => numCompare(a.avg_min || 0, b.avg_min || 0),
  avg_max: (a, b) => numCompare(a.avg_max || 0, b.avg_max || 0),
  variance: (a, b) => numCompare(a.variance / 100 || 0, b.variance / 100 || 0),
  precip: (a, b) => numCompare(a.precip || 0, b.precip || 0),
};

class Table {
  constructor ({ element, model }) {
    this.element = element
    this.model = model

    this.state = {
      orderBy: 'station',
      order: ASC,
    }
  }

  _removeListeners () {
    const getListeners = window.getEventListeners

    COLUMNS.map(({ key }, index) => {
      const column = this.element.querySelector(`th:nth-of-type(${index + 1})`)

      if (column) {
        column.removeEventListener('click', this._listeners[index], false)
      }
    })
  }

  _setListeners () {
    this._listeners = []

    COLUMNS.forEach(({ key }, index) => {
      const column = this.element.querySelector(`th:nth-of-type(${index + 1})`)
      const handler = () => this._sortBy(key)

      column.addEventListener('click', handler)
      this._listeners.push(handler)
    })
  }

  _sortBy (orderBy) {
    const invertOrder = orderBy === this.state.orderBy
    const order = invertOrder ? this.state.order * -1 : DESC

    this.state = { orderBy, order }
    this.render()
  }

  _loading () {
    const activeColumn = this.state.orderBy
    const order = this.state.order === ASC ? 'asc' : 'desc';

    return `
      <table>
        <thead>
          <tr>
            ${COLUMNS.reduce((html, { key, label }) => (
              html += `
                <th class="${activeColumn === key ? order : ''}">
                  ${label}
                </th>
              `
            ), '')}
          </tr>
        </thead>
        <tbody>
          <div class="loading">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </tbody>
      </table>
    `
  }

  template (data = []) {
    const sortedData = stableSort(data, (a, b) => (
      COMPARATORS[this.state.orderBy](a, b) * this.state.order
    ))
    const activeColumn = this.state.orderBy
    const order = this.state.order === ASC ? 'asc' : 'desc';

    return `
      <table>
        <thead>
          <tr>
            ${COLUMNS.reduce((html, { key, label }) => (
              html += `
                <th class="${activeColumn === key ? order : ''}">
                  ${label}
                </th>
              `
            ), '')}
          </tr>
        </thead>
        <tbody>
          ${sortedData.reduce((html, datum) => (
            html += `
              <tr>
                ${COLUMNS.reduce((row, column) => (
                  row += `<td>${column.render(datum)}</td>`
                ), '')}
              </tr>
            `
          ), '')}
        </tbody>
      </table>
    `
  }

  render () {
    this._removeListeners()
    this.element.innerHTML = this._loading()

    setTimeout(() => {
      this.element.innerHTML = this.template(this.model.toJSON())
      this._setListeners()
    }, 1)

    return this
  }
}

App.Views.Table = Table
