export const TROUBLESHOOTING_CATEGORY_OPTIONS = [
  {
    value: "JAVA",
    label: "Java",
  },
  {
    value: "SPRING",
    label: "Spring",
  },
  {
    value: "DATABASE",
    label: "Database",
  },
  {
    value: "REACT",
    label: "React",
  },
  {
    value: "NETWORK",
    label: "Network",
  },
  {
    value: "DEPLOYMENT",
    label: "Deployment",
  },
  {
    value: "ETC",
    label: "기타",
  },
];

export const EMPTY_TROUBLESHOOTING_FORM = {
  title: "",
  category: "",
  problemSituation: "",
  errorMessage: "",
  cause: "",
  solution: "",
};

export const TROUBLESHOOTING_FIELD_LIMITS = {
  title: 100,
  problemSituation: 2000,
  errorMessage: 2000,
  cause: 2000,
  solution: 4000,
};

export const isSupportedTroubleshootingCategory = (category) =>
  TROUBLESHOOTING_CATEGORY_OPTIONS.some((option) => option.value === category);
