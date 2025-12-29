
import { CampaignMappingInfo, OrderLinkMappingInfo } from "../types";
import { authenticatedFetch } from "./authService";

const baseUrl = import.meta.env.VITE_API_URL;
const MAPPING_BASE = `${baseUrl}/mapping`;

export const getUnmappedCampaigns = async (): Promise<CampaignMappingInfo[]> => {
  const response = await authenticatedFetch(`${MAPPING_BASE}/campaigns`);
  if (!response.ok) throw new Error("Không thể tải danh sách chiến dịch");
  return response.json();
};

export const getOrderLinksWithMappings = async (): Promise<OrderLinkMappingInfo[]> => {
  const response = await authenticatedFetch(`${MAPPING_BASE}/orderLinks`);
  if (!response.ok) throw new Error("Không thể tải danh sách liên kết đơn hàng");
  return response.json();
};

export const mapCampaignToOrderLink = async (campaignId: number, orderLinkId: number): Promise<void> => {
  const response = await authenticatedFetch(`${MAPPING_BASE}/campaigns/${campaignId}/orderLinks/${orderLinkId}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error("Lỗi khi gán chiến dịch");
};

export const removeCampaignMapping = async (campaignId: number): Promise<void> => {
  const response = await authenticatedFetch(`${MAPPING_BASE}/campaigns/${campaignId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error("Lỗi khi gỡ gán chiến dịch");
};
