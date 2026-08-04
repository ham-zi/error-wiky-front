import api from "./axios";

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

const createListParams = ({
  page = DEFAULT_PAGE,
  size = DEFAULT_SIZE,
  keyword = "",
  category = "",
  sort = "latest",
}) => {
  const params = {
    page,
    size,
    sort,
  };

  const trimmedKeyword = keyword.trim();

  if (trimmedKeyword) {
    params.keyword = trimmedKeyword;
  }

  if (category) {
    params.category = category;
  }

  return params;
};

export const getTroubleshootings = async ({
  page = DEFAULT_PAGE,
  size = DEFAULT_SIZE,
  keyword = "",
  category = "",
  sort = "latest",
  signal,
} = {}) => {
  const response = await api.get("/troubleshootings", {
    params: createListParams({
      page,
      size,
      keyword,
      category,
      sort,
    }),
    signal,
  });

  return response.data;
};

export const getMyTroubleshootings = async ({
  page = DEFAULT_PAGE,
  size = DEFAULT_SIZE,
  keyword = "",
  category = "",
  sort = "latest",
  signal,
} = {}) => {
  const response = await api.get("/users/troubleshootings", {
    params: createListParams({
      page,
      size,
      keyword,
      category,
      sort,
    }),
    signal,
  });

  return response.data;
};

export const getTroubleshootingDetail = async (
  troubleshootingId,
  { signal } = {},
) => {
  const response = await api.get(`/troubleshootings/${troubleshootingId}`, {
    signal,
  });

  return response.data;
};

export const createTroubleshooting = async (requestData) => {
  const response = await api.post("/troubleshootings", requestData);

  return response.data;
};

export const updateTroubleshooting = async (troubleshootingId, requestData) => {
  const response = await api.put(
    `/troubleshootings/${troubleshootingId}`,
    requestData,
  );

  return response.data;
};

export const recommendTroubleshootingMetadata = async (requestData) => {
  const response = await api.post(
    "/ai/troubleshootings/recommend",
    requestData,
  );

  return response.data;
};
