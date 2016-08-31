/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 10/23/14.
 */

module.exports = {

  pointTables: {
    kenya_cicos_2015: [
      "Hire Purchase/Leasing/Factoring",
      "Commercial Bank and Mortgage Finance",
      "Insurance Service Provider",
      "Post Office",
      "Bank Agent",
      "Stand alone ATM",
      "Pension Provider",
      "Micro Finance Banks",
      "Development Finance Service Provider",
      "Micro Finance Institution",
      "Forex Bureaus",
      "Capital Markets Service Provider",
      "Money Transfer Service",
      "Savings and Credit Co-operative (SACCO)",
      "Mobile Money Agent"
    ],
    uganda_cicos_2015: [
      "Bank Branches",
      "Savings and credit co-operatives (SACCOs)",
      "Offsite ATMs",
      "Post offices",
      "Credit institutions",
      "Microfinance Institute",
      "Microfinance deposit taking institution",
      "Mobile Money Agent"
    ],
    nigeria_cicos_2015: [
      "Mobile Network Operators",
      "PENCOM",
      "Primary Mortgage Banks",
      "NAICOM",
      "Microfinance Institutions",
      "Finance Companies",
      "Microfinance Bank",
      "Bank Agent",
      "Off Site ATM",
      "Development Finance Institution",
      "Securities Exchange Commission",
      "Post Offices",
      "Bureau de Change",
      "Commercial Bank",
      "Markets",
      "Motor Parks",
      "Mobile Money Agent"
    ],
    tanzania_cicos_2014: [
      "SACCO",
      "POS",
      "Bus Stand",
      "Community Bank",
      "Post Office",
      "Off-site ATM",
      "Microfinance Institute (MFI)",
      "3rd Party Payment Providers",
      "Commercial Bank",
      "On-site ATM",
      "Mobile Money Agent"
    ],
    bangladesh_cicos_2013: [
      "Bank Branches",
      "Offsite ATMs",
      "MFIs",
      "SACCOs",
      "Post Offices",
      "Mobile Money Agent"
    ],
    india_cicos_2014: [
      'Bank Customer Service Points',
      'Commercial Banks',
      'MFIs',
      'Offsite ATMs',
      'Postal Outlets'
    ],
    india_library_2014: [
      "Public Library",
      "Village",
      "Private Library",
      "District"
    ],
    india_health_2014: [
      "Sub Health Centres",
      "ANM or District Training Centres",
      "District Hospitals",
      "Additional Primary Health Centres (APHC)",
      "Community Health Centre (CHC)/First Referral Units",
      "Nursing Schools",
      "Approved Nursing Training Centres (Private Sector)",
      "Sub Divisional District Hospitals",
      "Medical Colleges and Hospitals",
      "Primary Health Centre (PHC)",
      "Private hospitals and clinics"
    ],
    india_agriculture_2014: [
      "Dairy Processors",
      "Day old chick hatcheries",
      "Private sector Agricultural service providers",
      "Government Vets",
      "Market Locations",
      "Agro-dealers",
      "Warehouse/Storage/Aggregation Centres",
      "Dairy chilling plants",
      "Processors/value addition points",
      "Farmer Organisations and Cooperatives",
      "Artificial Insemination Centres",
      "National/Regional/State Research Stations",
      "Seed Multipliers"
    ],
    kenya_agriculture_2015: [
      "Dairy Processors",
      "Private Sector Agricultural Service Providers",
      "Warehouse/Storage/Aggregation Centres/Collection Centres",
      "Processors/Value Addition Points",
      "Abattoirs/ Slaughter Houses",
      "Government And Private Vets",
      "Seed Multipliers/Seed Companies",
      "National/Regional/State Research Stations",
      "Agro-Dealers",
      "Day Old Chick Hatcheries",
      "Fish Hatcheries",
      "Cattle Dips",
      "Fish Landing Sites",
      "Market Locations",
      "Ranches",
      "Dairy Chilling Plants",
      "Extension Posts/Offices",
      "Farmer Organisations And Cooperatives",
      "Artificial Insemination Centres"
    ],
    uganda_agriculture_2015: [
      "Dairy Processors",
      "Agriculture Inputs Agents / Sub Agents",
      "Agro-dealers",
      "Fish Ponds",
      "Abattoirs/ Slaughter slabs",
      "Warehouse/Storage/Aggregation Centres",
      "Processors/value addition points",
      "Farmer Organisations and Cooperatives",
      "Seed Multipliers"
    ],
    uganda_education_2015: [
      "Primary Schools (Private)",
      "Secondary Schools (Government Aided)",
      "Tertiary Educational Institutions (Government Aided)",
      "Primary Schools (Community)",
      "Secondary Schools (Community)",
      "Primary Schools (Government Aided)",
      "Post Primary Schools (Private)",
      "Tertiary Educational Institutions (Non- Government Funded)",
      "Non Formal Schools",
      "Pre-Primary Schools (Private)",
      "Secondary Schools (Private)",
      "Pre-Primary Schools (Community)",
      "Post Primary Schools (Government Aided)"
    ]
  },

  /**
   * Specify the side of the buffers around the points you want to
   * generate % population in a buffer around the points.
   */
  bufferSizes: [1,2,3,4],

  projections: {
    india: 32644,
    kenya: 32737,
    tanzania: 32736,
    nigeria: 32631,
    uganda: 32636,
    bangladesh: 32645
  },

  // PostGIS Database Connection
  postgres: {
    server: 'localhost',
    port: '',
    database: 'fsp',
    user: 'postgres',
    password: ''
  }

};

