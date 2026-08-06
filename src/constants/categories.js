export const categories = [
  { value: "LANGUAGE", label: "프로그래밍 언어" },
  { value: "FRONTEND", label: "프론트엔드" },
  { value: "BACKEND", label: "백엔드" },
  { value: "DATABASE", label: "데이터베이스" },
  { value: "MOBILE", label: "모바일" },
  {
    value: "CLOUD_INFRA",
    label: "클라우드·인프라",
  },
  {
    value: "DEVOPS_CICD",
    label: "DevOps·CI/CD",
  },
  { value: "NETWORK", label: "네트워크" },
  { value: "SECURITY", label: "보안·인증" },
  { value: "TESTING", label: "테스트" },
  {
    value: "BUILD_DEPENDENCY",
    label: "빌드·의존성",
  },
  {
    value: "OS_ENVIRONMENT",
    label: "운영체제·환경설정",
  },
  {
    value: "VERSION_CONTROL",
    label: "Git·버전 관리",
  },
  { value: "AI_DATA", label: "AI·데이터" },
  { value: "ETC", label: "기타" },
];

export const categoryLabels = Object.fromEntries(
  categories.map(({ value, label }) => [value, label]),
);
