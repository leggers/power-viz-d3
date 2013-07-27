# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

require 'rest-client'
require 'json'


def all_suffixes
    @state_abbrevs.each do |state|
        @series_names.each do |series|
            suffix = @generic_series_part.gsub @insert, "#{series[1]}-#{state}"
            add_to_db(state, series[0].to_s, request_url(suffix))
        end
    end
end

def washington_suffixes
    @series_names.each do |series|
        suffix = @generic_series_part.gsub @insert, "#{series[1]}-WA"
        add_to_db("WA", series[0].to_s, request_url(suffix))
    end
end

def request_url suffix
    url = @base_url.gsub /suffix/, suffix
    url
end

def add_to_db state, type, url
    toAdd = JSON.parse(RestClient.get(url))
    if toAdd["series"]
        series = toAdd["series"][0]
        start_year = series["start"].to_i
        data = series["data"]
        if start_year > @min_year
            for i in 1..start_year-@min_year
                data << ["#{start_year-i}", "0"]
            end
        end
        end_year = series["end"].to_i
        if end_year > @max_year
            @max_year = end_year
        end
        if end_year < @max_year
            for i in end_year+1..@max_year
                data.unshift ["#{i}", "0"]
            end
        end
        stringified_data = data.to_s
        table_data = stringified_data.gsub "nil", "0"
        GenData.create!(
            state: state,
            description: type,
            present: true,
            data: table_data
            )
    else
        GenData.create!(
            state: state,
            description: type,
            present: false,
            data: nil
            )
    end
end

@api_key = 'D5AF84ED3D2DB336937D8721A5AD63DA'
@state_abbrevs = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
    'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
    'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WI', 'WV', 'WY', 'WA']
@generic_series_part = "ELEC.GEN.type-state-99.A"
@series_names = {coal: "COW", pet_liquid: "PEL", pet_coke: "PC", nat_gas: "NG", other_gases: "OOG",
    nuclear: "NUC", hydro: "HYC", other_renew: "AOR", wind: "WND", solar: "SUN", wood: "WWW",
    geo: "GEO", biomass: "WAS", hydro_pumped: "HPS", other: "OTH"}
@insert = /type-state/
@base_url = "http://api.eia.gov/series/?api_key=#{@api_key}&series_id=suffix"
@max_year = 2012
@min_year = 2001

GenData.delete_all
all_suffixes