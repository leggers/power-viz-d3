class VizController < ApplicationController
  def index
    @state_abbrevs = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'ID', 'IL', 'IN', 'HI',
      'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
      'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WI', 'WV', 'WY', 'WA']
    @green = {coal: -1, nat_gas: -1, nuclear: 1, hydro: 1,
      wind: 1, solar: 1, geo: 1, biomass: 1, other_renew: 1, wood: 1,
      hydro_pumped: 0, pet_liquid: -1, pet_coke: -1, other_gases: 0, other: 0}
    gon.green = @green
    gon.state_abbrevs = @state_abbrevs

    state_data = {}
    @state_abbrevs.each do |state|
      state_data[state] = {}
      GenData.where(state: state).each do |entry|
          if entry.present
              state_data[state][entry.description] = JSON.parse entry.data
          else
              state_data[state][entry.description] = "no data"
          end
      end
    end

    gon.elec_data = state_data

    @translations = {coal: "Coal", pet_liquid: "Petroleum Liquid", pet_coke: "Petroleum Coke", nat_gas: "Natural Gas", other_gases: "Other Gasses", nuclear: "Nuclear",
      hydro: "Hydroelectric", other_renew: "Other Renewable", wind: "Wind", solar: "Solar", wood: "Wood", geo: "Geothermal", biomass: "Biomass",
      hydro_pumped: "Pumped Hydroelectric", other: "Other"}
  end
end
