import TravelCheckStakingArtifact from "../TravelCheckStaking.json";
import TravelCheckAttractionArtifact from "../TravelCheckAttraction.json";
import TravelCheckBadgeArtifact from "../TravelCheckBadge.json";

export const CONTRACT_ADDRESSES = {
  TravelCheckStaking: "0x489c34CCFbf5eda27Cf5A06d5841086F1Cf7bbae",
  TravelCheckAttraction: "0xAA7363cD324Be1EF8a6efeF8C3ACcBfe16629b85",
  TravelCheckBadge: "0x38e4654b63993025c07C360b71213A46BEecEA94"
};

export const CONTRACT_ABIS = {
  TravelCheckStaking: TravelCheckStakingArtifact.abi,
  TravelCheckAttraction: TravelCheckAttractionArtifact.abi,
  TravelCheckBadge: TravelCheckBadgeArtifact.abi
};
