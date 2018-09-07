!function () {
  const { weather } = App.Datasets
  const { Collection } = App.Models
  const { ScatterMap, ScatterPlot, Table } = App.Views

  const formatDeg = degrees => String(degrees).replace(/(.+)(.)$/, '$1.$2') + '\xB0C'
  const formatVar = variance => String(variance / 100)

  // Fig. 1
  !function () {
    const element = document.querySelector('.scatter-map')
    const model = new Collection({ data: weather })
    const data = model.avgTemp()
    const view = new ScatterMap({ element, data, format: formatDeg })

    view.render()

    const select = document.querySelector('select')

    select.addEventListener('change', ({ target: { value } }) => {
      const format = value === 'variance' ? formatVar : formatDeg

      view.setData(model[value](), format)
      view.render()
    })
  }()

  // Fig. 2
  setTimeout(() => {
    const element = document.querySelector('.scatter-plot')
    const model = new Collection({ data: weather })

    new ScatterPlot({ element, model }).render()
  }, 1500)

  // Fig. 3
  setTimeout(() => {
    const element = document.querySelector('.tabular-data')
    const model = new Collection({ data: weather })

    new Table({ element, model }).render()
  }, 3000)
}()
