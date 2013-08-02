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

    @translations = {coal: "Coal", pet_liquid: "Petroleum\nLiquid", pet_coke: "Petroleum\nCoke",
      nat_gas: "Natural Gas", other_gases: "Other Gasses", nuclear: "Nuclear",
      hydro: "Hydroelectric", other_renew: "Other Renewable", wind: "Wind",
      solar: "Solar", wood: "Wood", geo: "Geothermal", biomass: "Biomass",
      hydro_pumped: "Pumped\nHydroelectric", other: "Other"}

    @pie_colors = {coal: "#323232", pet_liquid: '#33401c', pet_coke: '#362012', nat_gas: '#002342',
      other_gases: '#69c3e4', nuclear: '#01e512', hydro: '#2a30fb', other_renew: '#227a47',
      wind: '#0de6f0', solar: '#dee118', wood: '#947603', geo: '#e7c130', biomass: '#3d8b54',
      hydro_pumped: '#1c35b4', other: '#d91bdb'}

    gon.pie_colors = @pie_colors
  end
end
