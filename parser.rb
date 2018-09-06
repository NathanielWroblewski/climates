require 'csv'
require 'json'

STATIONS_TXT = './data/stations.txt'.freeze
STATIONS_FORMAT = /^(.{11}) (.{8}) (.{9}) (.{6}) (.{2}) (.{30})/
STATIONS_CSV = '\1,\2,\3,\5,\6'.freeze
WEATHER_CSV = './data/2017.csv'.freeze
DESTINATION_CSV = './data/output.csv'
DESTINATION_JSON = './data/output.json'
CONTIGUOUS_US = %w[
  AL AZ AR CA CO CT DE DC FL GA ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE
  NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY
].freeze
NUM_MEASUREMENTS_THRESHOLD = 120

STATIONS = Hash.new { |hash, key| hash[key] = {} }
TYPE_MAP = {
  PRCP: :precipitation, # tenths of mm
  SNOW: :snowfall,      # in mm
  TMAX: :max_temps,     # tenths of degrees C
  TMIN: :min_temps,     # tenths of degrees C
}.freeze

File.readlines(STATIONS_TXT).each do |line|
  id, lat, long, state, name = line.sub(STATIONS_FORMAT, STATIONS_CSV).split(',')

  if CONTIGUOUS_US.include?(state.strip)
    STATIONS[id] = {
      latitude: lat.strip,
      longitude: long.strip,
      state: state.strip,
      name: name.sub(/\s{2,}.*/, '').chomp,
      min_temps: [],
      max_temps: [],
      precipitation: [],
      snowfall: []
    }
  end
end

CSV.foreach(WEATHER_CSV) do |row|
  id, date, code, measurement, _, _, _, _ = row
  type = TYPE_MAP[code.strip.to_sym]

  next if STATIONS[id].empty? || type.nil?

  STATIONS[id][type].push(measurement.strip.to_i)
end

CSV.open(DESTINATION_CSV, 'w') do |csv|
  csv << %w[
    id lat long state name min max avg_min avg_max avg_temp variance precip snowfall
  ]

  STATIONS.each do |id, info|
    min_temps = info[:min_temps].to_a.compact
    max_temps = info[:max_temps].to_a.compact

    next if min_temps.empty? || max_temps.empty? || info[:precipitation].to_a.empty?

    all_temps = min_temps + max_temps
    avg_temp = all_temps.sum.to_f / all_temps.length
    variance = all_temps.map { |temp| (temp - avg_temp) ** 2 }.sum.to_f / all_temps.length

    csv << [
      id,
      info[:latitude],
      info[:longitude],
      info[:state],
      info[:name],
      min_temps.min.to_i,
      max_temps.max.to_i,
      min_temps.sum.to_f / min_temps.length,
      max_temps.sum.to_f / max_temps.length,
      avg_temp,
      variance,
      info[:precipitation].to_a.compact.sum,
      info[:snowfall].to_a.compact.sum
    ]
  end
end

json = {
  data: []
}

CSV.foreach(DESTINATION_CSV, headers: true, header_converters: :symbol) do |row|
  json[:data].push(row.to_h)
end

File.open(DESTINATION_JSON, 'w') do |file|
  file << JSON.dump(json)
end
