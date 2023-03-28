const user = {
  Username: "jondoe",
  FirstName: "Jon",
  LastName: "doe",
  Mail: "jon.doe@3ds.com",
  Token: {
    Id: "c0544aba-313e-44ac-808b-0c372d2af780",
    Expiration: "05/30/2021 12:24:43 ",
  },
  Roles: [
    {
      Name: "Administrator",
    },
  ],
  Rights: [
    {
      Name: "B_VIEW_PROJECTS",
    },
  ],
  Groups: [
    {
      Id: "f3JRQ0RfRg==",
      Name: "3DEXCITE",
    },
    {
      Id: "f3JRQ0RfRQ==",
      Name: "ExcavatorDemo",
    },
    {
      Id: "f3JRQ0RfRA==",
      Name: "ExcavatorDemoBudget",
    },
  ],
};

const brands = [
  {
    Id: "d8d1f8b2-72ee-45d2-8730-419aa3fa124d",
    Name: "Chevrolet",
  },
  {
    Id: "e027ad73-905c-437f-a2bd-14d5dbdee9e6",
    Name: "Buick",
  },
  {
    Id: "de9f400f-bba0-43ce-b24e-5725fb1fbc12",
    Name: "Cadillac",
  },
  {
    Id: "cd680e9a-dae8-413a-a479-7f935810002b",
    Name: "GMC",
  },
];

const years = [
  {
    Id: "dGNEVVld",
    Name: "2021",
  },
  {
    Id: "dGNEVVla",
    Name: "2022",
  },
];

const models = [
  {
    Id: "dGNEVVld",
    Name: "Escalade",
    Revision: {
      Id: "3",
      Name: "2021",
    },
  },
  {
    Id: "dGNEVVla",
    Name: "CT4",
    Revision: {
      Id: "3",
      Name: "2021",
    },
  },
  {
    Id: "dGNEVVlb",
    Name: "CT5",
    Revision: {
      Id: "3",
      Name: "2021",
    },
  },
  {
    Id: "dGNEVVlY",
    Name: "Lyric",
    Revision: {
      Id: "3",
      Name: "2021",
    },
  },
  {
    Id: "dGNEVVlZ",
    Name: "XT4",
    Revision: {
      Id: "3",
      Name: "2021",
    },
  },
  {
    Id: "dGNEVVlW",
    Name: "XT5",
    Revision: {
      Id: "3",
      Name: "2021",
    },
  },
  {
    Id: "dGNEVVlX",
    Name: "XT6",
    Revision: {
      Id: "3",
      Name: "2021",
    },
  },
];

module.exports = {
  user,
  brands,
  years,
  models,
};
