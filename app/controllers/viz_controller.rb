class VizController < ApplicationController
  def index
    @state_abbrevs = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'ID', 'IL', 'IN', 'HI',
      'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
      'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
      'VA', 'VT', 'WI', 'WV', 'WY', 'WA'
    ]
    @green = {
      coal: -1, nat_gas: -1, nuclear: 1, hydro: 1,wind: 1, solar: 1, geo: 1, biomass: 1,
      wood: 1, hydro_pumped: 0, pet_liquid: -1, pet_coke: -1, other_gases: 0, other: 0
      #, other_renew: 1
    }
    gon.green = @green
    gon.state_abbrevs = @state_abbrevs

    state_data = {}
    @state_abbrevs.each do |state|
      state_data[state] = {}
      GenData.where(state: state).each do |entry|
          if entry.present
              state_data[state][entry.description] = JSON.parse entry.data unless entry.description == 'other_renew'
          else
              state_data[state][entry.description] = "no data"
          end
      end
    end

    gon.elec_data = state_data

    @translations = {
      coal: "Coal", pet_liquid: "Petroleum Liquid", pet_coke: "Petroleum Coke",
      nat_gas: "Natural Gas", other_gases: "Other Gasses", nuclear: "Nuclear",
      hydro: "Hydroelectric", wind: "Wind", solar: "Solar", wood: "Wood",
      geo: "Geothermal", biomass: "Biomass", hydro_pumped: "Pumped Hydroelectric",
      other: "Other"
    # , other_renew: "Other Renewables"
    }

    @state_names = {
      :AL => 'Alabama', :AK => 'Alaska', :AZ => 'Arizona', :AR => 'Arkansas', :CA => 'California',
      :CO => 'Colorado', :CT => 'Connecticut', :DE => 'Delaware', :DC => 'District of Columbia',
      :FL => 'Florida', :GA => 'Georgia', :ID => 'Idaho', :IL => 'Illinois', :IN => 'Indiana',
      :HI => 'Hawaii', :IA => 'Iowa', :KS => 'Kansas', :KY => 'Kentucky', :LA => 'Louisiana',
      :ME => 'Maine', :MD => 'Maryland', :MA => 'Massachusets', :MI => 'Michigan',
      :MN => 'Minnesota', :MS => 'Mississippi', :MO => 'Missouri', :MT => 'Montana',
      :NE => 'Nebraska', :NV => 'Nevada', :NH => 'New Hampshire', :NJ => 'New Jersey',
      :NM => 'New Mexico', :NY => 'New York', :NC => 'North Carolina', :ND => 'North Dakota',
      :OH => 'Ohio', :OK => 'Oklahoma', :OR => 'Oregon', :PA => 'Pennsylvania',
      :RI => 'Rhode Island', :SC => 'South Carolina', :SD => 'South Dakota', :TN => 'Tennessee',
      :TX => 'Texas', :UT => 'Utah', :VA => 'Virginia', :VT => 'Vermont', :WI => 'Wisconsin',
      :WV => 'West Virginia', :WY => 'Wyoming', :WA => 'Washington'
    }

    @pie_colors = {coal: "#000", pet_liquid: '#33401c', pet_coke: '#777', nat_gas: '#2c70ad',
      other_gases: '#567d8b', nuclear: '#01e512', hydro: '#2a30fb',
      wind: '#0de6f0', solar: '#dee118', wood: '#947603', geo: '#e7c130', biomass: '#3d8b54',
      hydro_pumped: '#1c35b4', other: '#d91bdb'
    # , other_renew: '#227a47'
    }

    gon.pie_colors = @pie_colors
    gon.translations = @translations
    gon.state_names = @state_names
  end
end
