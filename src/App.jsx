import { useState } from "react";
import data from "./data/room_pricing_production_model.json";

import {
  Monitor,
  Server,
  Mic,
  Speaker,
  Camera,
  Cpu,
  Layout,
  Settings,
  Zap,
  Network,
  BatteryCharging,
  Activity,
  Columns3,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  Users
} from "lucide-react";

const COMPLEXITY_OPTIONS = [
  {
    key: "Basic",
    scale: 1,
    title: "Basic",
    description: "BYOD focused, minimal in-room technology",
    level: 1
  },
  {
    key: "Standard",
    scale: 2,
    title: "Standard",
    description: "Dedicated room system with consistent user experience",
    level: 2
  },
  {
    key: "Advanced",
    scale: 3,
    title: "Advanced",
    description: "Integrated AV with DSP, control, and enhanced coverage",
    level: 3
  },
  {
    key: "Expert",
    scale: 5,
    title: "Expert",
    description: "Mission critical, specialist, or high-performance spaces",
    level: 4
  }
];

const SIZE_METADATA = {
  huddle: {
    label: "Huddle Room",
    short: "H",
    capacity: "1–6",
    image: "/images/room-sizes/huddle.png",
    order: 1
  },
  small: {
    label: "Small Room",
    short: "S",
    capacity: "4–6",
    image: "/images/room-sizes/small.png",
    order: 2
  },
  medium: {
    label: "Medium Room",
    short: "M",
    capacity: "6–10",
    image: "/images/room-sizes/medium.png",
    order: 3
  },
  large: {
    label: "Large Room",
    short: "L",
    capacity: "11–16",
    image: "/images/room-sizes/large.png",
    order: 4
  },
  xlarge: {
    label: "X-Large Room",
    short: "XL",
    capacity: "17–24",
    image: "/images/room-sizes/xlarge.png",
    order: 5
  }
};

const ROOM_SIZE_DEFINITIONS = [
  {
    label: "Dimensions (ft)",
    huddle: "8 × 10",
    small: "12 × 12",
    medium: "15 × 20",
    large: "20 × 20",
    xlarge: "25 × 30"
  },
  {
    label: "Capacity (people)",
    huddle: "2–4",
    small: "4–6",
    medium: "6–10",
    large: "10–16",
    xlarge: "16–24"
  },
  {
    label: "Display",
    huddle: "1 × 50–55″ 4K",
    small: "1 × 55–65″ 4K",
    medium: "1 or 2 × 65–75″ 4K",
    large: "2 × 75–85″ 4K",
    xlarge: "2 × 85–98″+ 4K"
  },
  {
    label: "Camera FOV",
    huddle: "~120°+",
    small: "~120°+",
    medium: "~85–100°",
    large: "~70–90°",
    xlarge: "~60–75°"
  },
  {
    label: "Mic Placement",
    huddle: "Front-of-room bar",
    small: "Front-of-room bar or 1 × table mic",
    medium: "Front-of-room bar or 2 × table mics",
    large: "3–4 table mics or ceiling array",
    xlarge: "1–2 ceiling arrays or 4–6 table mics"
  }
];

function resolveSizeMeta(size) {
  const id = size.id.toLowerCase();

  if (id.includes("huddle")) return SIZE_METADATA.huddle;
  if (id.includes("small")) return SIZE_METADATA.small;
  if (id.includes("medium")) return SIZE_METADATA.medium;
  if (id.includes("large") && !id.includes("x")) return SIZE_METADATA.large;
  if (id.includes("x") || id.includes("xl")) return SIZE_METADATA.xlarge;

  return {
    label: size.label || size.id,
    short: "?",
    capacity: size.capacity || "",
    image: null,
    order: 99
  };
}

const ROOM_TYPE_IMAGE_MAP = {
  "Meeting Room": "/images/room-types/meetingroom.png",
  "Executive Boardroom": "/images/room-types/executiveboardroom.png",
  "Multipurpose Room": "/images/room-types/multipurposeroom.png",
  "Training Room": "/images/room-types/trainingroom.png",
  "Equipment Room": "/images/room-types/equipmentroom.png",
  "Digital Signage": "/images/room-types/digitalsignage.png",
  "Open Space": "/images/room-types/openspace.png"
};

function getSizeKey(sizeId) {
  const id = sizeId.toLowerCase();

  if (id.includes("huddle")) return "huddle";
  if (id.includes("small")) return "small";
  if (id.includes("medium")) return "medium";
  if (id.includes("large") && !id.includes("x")) return "large";
  if (id.includes("x") || id.includes("xl")) return "xlarge";

  return "";
}

function getRoomTypeImage(roomType) {
  if (!roomType) return null;

  if (ROOM_TYPE_IMAGE_MAP[roomType]) {
    return ROOM_TYPE_IMAGE_MAP[roomType];
  }

  const fileName = roomType
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .concat(".png");

  return `/images/room-types/${fileName}`;
}

function ComplexityIcon({ level, active }) {
  return (
    <div style={styles.complexityIconWrap}>
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          style={{
            ...styles.complexityBar,
            height: `${12 + bar * 8}px`,
            background:
              bar <= level
                ? active
                  ? "#2563eb"
                  : "#3b82f6"
                : "#cbd5e1"
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [roomType, setRoomType] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [complexity, setComplexity] = useState("");
  const [hoveredRoomType, setHoveredRoomType] = useState("");
  const [hoveredSizeId, setHoveredSizeId] = useState("");
  const [hoveredComplexity, setHoveredComplexity] = useState("");
  const [brokenRoomTypeImages, setBrokenRoomTypeImages] = useState({});

  const roomTypes = [...new Set(data.roomConfigurations.map((c) => c.roomType))];

  const filteredSizes = data.roomSizes.filter((s) =>
    roomType ? s.appliesTo.includes(roomType) : true
  );

  const availableConfigs = data.roomConfigurations.filter(
    (c) =>
      (!roomType || c.roomType === roomType) &&
      (!sizeId || c.sizeId === sizeId)
  );

  const availableComplexities = [
    ...new Set(availableConfigs.map((c) => c.complexity))
  ];

  const visibleComplexityOptions = COMPLEXITY_OPTIONS.filter((option) =>
    availableComplexities.includes(option.key)
  );

  const selectedComplexityObj = COMPLEXITY_OPTIONS.find(
    (option) => option.key === complexity
  );

  const result = data.roomConfigurations.find(
    (c) =>
      c.roomType === roomType &&
      c.sizeId === sizeId &&
      (selectedComplexityObj
        ? c.complexityScale === selectedComplexityObj.scale
        : c.complexity === complexity)
  );

  const complexityInfo = data.complexityDefinitions?.[complexity];
  const selectedSizeKey = getSizeKey(sizeId);
  const selectedSizeMeta = resolveSizeMeta({ id: sizeId });

  const getRoomSizeDetailIcon = (label) => {
    const normalized = label.toLowerCase();
    if (normalized.includes("dimensions")) return <Layout size={18} />;
    if (normalized.includes("capacity")) return <Users size={18} />;
    if (normalized.includes("display")) return <Monitor size={18} />;
    if (normalized.includes("camera")) return <Camera size={18} />;
    if (normalized.includes("mic")) return <Mic size={18} />;
    return <Layout size={18} />;
  };

  const roomSizeDetails = ROOM_SIZE_DEFINITIONS.map((row) => ({
    label: row.label,
    value: row[selectedSizeKey],
    icon: getRoomSizeDetailIcon(row.label)
  }));

  const handleRoomTypeChange = (value) => {
    setRoomType(value);
    setSizeId("");
    setComplexity("");
  };

  const handleSizeChange = (value) => {
    setSizeId(value);
    setComplexity("");
  };

  const getIcon = (device) => {
    const text = typeof device === "string" ? device : device.name || "";
    const t = text.toLowerCase();

    if (t.includes("rack")) return <Server size={18} />;
    if (
      t.includes("display") ||
      t.includes("screen") ||
      t.includes("projection") ||
      t.includes("projector") ||
      t.includes("video wall") ||
      t.includes("dvled")
    ) {
      return <Monitor size={18} />;
    }
    if (t.includes("mic")) return <Mic size={18} />;
    if (t.includes("speaker") || t.includes("audio")) return <Speaker size={18} />;
    if (t.includes("camera") || t.includes("ptz")) return <Camera size={18} />;
    if (
      t.includes("dsp") ||
      t.includes("processor") ||
      t.includes("compute") ||
      t.includes("codec")
    ) {
      return <Cpu size={18} />;
    }
    if (t.includes("network") || t.includes("switch")) return <Network size={18} />;
    if (t.includes("server")) return <Server size={18} />;
    if (t.includes("ups") || t.includes("power")) return <BatteryCharging size={18} />;
    if (t.includes("monitoring")) return <Activity size={18} />;
    if (t.includes("control") || t.includes("preset")) return <Settings size={18} />;
    if (t.includes("lighting") || t.includes("shade")) return <Zap size={18} />;
    if (t.includes("console") || t.includes("operator")) return <Columns3 size={18} />;
    if (t.includes("wireless") || t.includes("sharing")) return <Radio size={18} />;
    if (t.includes("redundant") || t.includes("secure")) return <ShieldCheck size={18} />;
    if (t.includes("kvm") || t.includes("routing") || t.includes("switching")) {
      return <SlidersHorizontal size={18} />;
    }

    return <Layout size={18} />;
  };

  const getDeviceName = (device) => {
    const name = typeof device === "string" ? device : device.name;
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <img
            src="/images/logos/Kinly-Logo-Negative-Transparent-RBG.png"
            alt="Kinly"
            style={styles.logoImage}
          />
          <div>
            <h1 style={styles.title}>Room Configuration Tool</h1>
            <p style={styles.subtitle}>
              Define a standardised collaboration solution profile
            </p>
          </div>
        </div>

        <div style={styles.inputCard}>
          <div style={styles.field}>
            <div style={styles.stepHeader}>
              <div style={styles.stepBadge}>1</div>
              <label style={styles.label}>Room Type</label>
            </div>
            <div style={styles.roomTypeSelector}>
              {roomTypes.map((rt) => {
                const active = roomType === rt;
                const image = getRoomTypeImage(rt);

                return (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => handleRoomTypeChange(rt)}
                    onMouseEnter={() => setHoveredRoomType(rt)}
                    onMouseLeave={() => setHoveredRoomType("")}
                    style={{
                      ...styles.roomTypeCard,
                      ...(active ? styles.roomTypeCardActive : {}),
                      ...(hoveredRoomType === rt ? styles.roomTypeCardHover : {})
                    }}
                  >
                    <div style={styles.roomTypeImageWrap}>
                      {image && !brokenRoomTypeImages[rt] ? (
                        <img
                          src={image}
                          alt={rt}
                          style={styles.roomTypeImage}
                          onError={() =>
                            setBrokenRoomTypeImages((prev) => ({
                              ...prev,
                              [rt]: true
                            }))
                          }
                        />
                      ) : (
                        <div style={styles.roomTypePlaceholder}>
                          <Layout size={24} />
                        </div>
                      )}
                    </div>
                    <div style={styles.roomTypeTitle}>{rt}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.field}>
            <div style={styles.stepHeader}>
              <div style={styles.stepBadge}>2</div>
              <label style={styles.label}>Room Size</label>
            </div>

            {!roomType ? (
              <div style={styles.helperText}>
                Select a room type to view available room sizes.
              </div>
            ) : (
              <>
                <div style={styles.sizeSelector}>
                  {filteredSizes
                    .sort(
                      (a, b) => resolveSizeMeta(a).order - resolveSizeMeta(b).order
                    )
                    .map((size) => {
                      const meta = resolveSizeMeta(size);
                      const active = sizeId === size.id;

                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => handleSizeChange(size.id)}
                          onMouseEnter={() => setHoveredSizeId(size.id)}
                          onMouseLeave={() => setHoveredSizeId("")}
                          style={{
                            ...styles.sizeCard,
                            ...(active ? styles.sizeCardActive : {}),
                            ...(hoveredSizeId === size.id ? styles.sizeCardHover : {})
                          }}
                        >
                          <div>
                            <div style={styles.sizeTitle}>{meta.label}</div>

                            <div style={styles.sizeCapacity}>
                              <Users size={16} style={styles.capacityIcon} />
                              <span>{meta.capacity}</span>
                            </div>
                          </div>

                          <div style={styles.sizeImageWrap}>
                            {meta.image && (
                              <img
                                src={meta.image}
                                alt={meta.label}
                                style={styles.sizeImage}
                              />
                            )}
                          </div>

                          <div style={styles.sizeBadge}>{meta.short}</div>
                        </button>
                      );
                    })}
                </div>

                <div style={styles.definitionWrapper}>
                  <table style={styles.definitionTable}>
                    <thead>
                      <tr>
                        <th style={styles.definitionHeaderCell}></th>
                        <th style={styles.definitionHeaderCell}>Huddle</th>
                        <th style={styles.definitionHeaderCell}>Small</th>
                        <th style={styles.definitionHeaderCell}>Medium</th>
                        <th style={styles.definitionHeaderCell}>Large</th>
                        <th style={styles.definitionHeaderCell}>X-Large</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROOM_SIZE_DEFINITIONS.map((row) => (
                        <tr key={row.label}>
                          <td style={styles.definitionLabelCell}>{row.label}</td>
                          {["huddle", "small", "medium", "large", "xlarge"].map(
                            (key) => (
                              <td
                                key={key}
                                style={{
                                  ...styles.definitionCell,
                                  ...(selectedSizeKey === key
                                    ? styles.definitionCellActive
                                    : {})
                                }}
                              >
                                {row[key]}
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div style={styles.field}>
            <div style={styles.stepHeader}>
              <div style={styles.stepBadge}>3</div>
              <label style={styles.label}>Complexity</label>
            </div>

            {!roomType || !sizeId ? (
              <div style={styles.helperText}>
                Select a room type and size to view available complexity levels.
              </div>
            ) : (
              <div style={styles.complexitySelector}>
                {visibleComplexityOptions.map((option) => {
                  const active = complexity === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setComplexity(option.key)}
                      onMouseEnter={() => setHoveredComplexity(option.key)}
                      onMouseLeave={() => setHoveredComplexity("")}
                      style={{
                        ...styles.complexityCard,
                        ...(active ? styles.complexityCardActive : {}),
                        ...(hoveredComplexity === option.key ? styles.complexityCardHover : {})
                      }}
                    >
                      <ComplexityIcon level={option.level} active={active} />

                      <div style={styles.levelLabel}>Level {option.level}</div>

                      <div style={styles.complexityCardTitle}>{option.title}</div>

                      <div style={styles.complexityCardDescription}>
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div style={styles.resultWrapper}>
            <div style={styles.resultHeader}>
              <h2 style={styles.resultTitle}>{result.displayName}</h2>

              <div style={styles.resultHeaderAside}>
                <div style={styles.infoPill}>
                  <div style={styles.infoPillIcon}>
                    <ComplexityIcon
                      level={selectedComplexityObj?.level || 0}
                      active={true}
                    />
                  </div>
                  <div>
                    <div style={styles.infoPillLabel}>Complexity</div>
                    <div style={styles.infoPillValue}>{result.complexity}</div>
                  </div>
                </div>

                <div style={styles.infoPill}>
                  <div style={styles.infoPillIcon}>
                    <div style={styles.sizeChip}>{selectedSizeMeta.short}</div>
                  </div>
                  <div>
                    <div style={styles.infoPillLabel}>Room Size</div>
                    <div style={styles.infoPillValue}>
                      {selectedSizeMeta.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p style={styles.description}>{result.description}</p>

            {complexityInfo && (
              <div style={styles.complexityBox}>
                <div style={styles.complexityTitle}>
                  Complexity: {result.complexity}
                </div>

                <div style={styles.complexityDesc}>
                  {complexityInfo.description}
                </div>

                <div style={styles.complexityGrid}>
                  {complexityInfo.characteristics.map((item, index) => (
                    <div key={index} style={styles.complexityItem}>
                      <span style={styles.complexityDot}></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.sizeBox}>
              <div style={styles.sizeBoxTitle}>
                Room Size: {selectedSizeMeta.label}
              </div>
              <div style={styles.sizeBoxDesc}>
                Key attributes for the selected room size.
              </div>
              <div style={styles.sizeBoxGrid}>
                {roomSizeDetails.map((item) => (
                  <div key={item.label} style={styles.sizeBoxItem}>
                    <div style={styles.sizeBoxHeader}>
                      <div style={styles.sizeBoxIcon}>{item.icon}</div>
                      <div style={styles.sizeBoxLabel}>{item.label}</div>
                    </div>
                    <div style={styles.sizeBoxValue}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.resultGrid}>
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Typical Devices</h3>

                <div style={styles.deviceList}>
                  {result.typicalDevices.map((device, index) => (
                    <div key={index} style={styles.deviceRow}>
                      <div style={styles.deviceIcon}>{getIcon(device)}</div>
                      <div style={styles.deviceText}>{getDeviceName(device)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.pricingCard}>
                <div style={styles.pricingTitle}>
                  {result.pricingModel === "Estimated"
                    ? "Estimated Pricing"
                    : "Pricing Model"}
                </div>

                {result.pricingModel === "Estimated" ? (
                  <>
                    <div style={styles.price}>
                      £{result.lowEstimate?.toLocaleString()} – £
                      {result.highEstimate?.toLocaleString()}
                    </div>
                    <div style={styles.priceNote}>
                      Based on standardised configuration
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.price}>Requires detailed design</div>
                    <div style={styles.priceNote}>
                      Pricing should be validated through solution design
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f0e2e",
    color: "#ffffff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "60px 20px"
  },

  container: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "0 10px"
  },

  title: {
    fontSize: "44px",
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: "8px"
  },

  subtitle: {
    textAlign: "center",
    color: "#b8b8c8",
    marginBottom: "40px"
  },

  headerRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    marginBottom: "24px",
    justifyContent: "center"
  },

  logoImage: {
    width: "160px",
    height: "auto",
    display: "block"
  },

  inputCard: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "30px",
    borderRadius: "16px",
    marginBottom: "30px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
  },

  field: {
    marginBottom: "30px"
  },

  label: {
    fontSize: "17px",
    color: "#ffffff",
    marginBottom: "0",
    display: "flex",
    alignItems: "center",
    height: "32px",
    textAlign: "left",
    letterSpacing: "0.3px",
    fontWeight: "700"
  },

  stepHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px"
  },

  stepBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    background: "#E05A3F",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "32px",
    flexShrink: 0
  },

  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    fontSize: "14px"
  },

  helperText: {
    color: "#b8b8c8",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "13px"
  },

  roomTypeSelector: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
    gap: "18px",
    width: "100%",
    maxWidth: "960px",
    margin: "0 auto",
    justifyItems: "stretch"
  },

  roomTypeCard: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    borderRadius: "18px",
    padding: "0",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
    overflow: "hidden",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)"
  },

  roomTypeCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 18px 38px rgba(224,90,63,0.25)",
    borderColor: "#E05A3F"
  },

  roomTypeCardActive: {
    border: "2px solid #E05A3F",
    background: "rgba(224,90,63,0.1)",
    boxShadow: "0 12px 28px rgba(224,90,63,0.3)"
  },

  roomTypeImageWrap: {
    width: "100%",
    background: "rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "140px",
    padding: "16px 12px",
    boxSizing: "border-box"
  },

  roomTypePlaceholder: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: "rgba(224,90,63,0.2)",
    color: "#E05A3F"
  },

  roomTypeImage: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "120px",
    width: "100%",
    height: "auto",
    objectFit: "contain"
  },

  roomTypeTitle: {
    fontWeight: "800",
    fontSize: "14px",
    padding: "16px 12px 18px",
    color: "#ffffff"
  },

  sizeSelector: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    width: "100%",
    maxWidth: "1040px",
    margin: "0 auto"
  },

  sizeCard: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    borderRadius: "18px",
    padding: "16px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
    minHeight: "230px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)"
  },

  sizeCardActive: {
    border: "2px solid #E05A3F",
    background: "rgba(224,90,63,0.1)",
    boxShadow: "0 12px 28px rgba(224,90,63,0.3)"
  },

  sizeCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 18px 36px rgba(224,90,63,0.25)",
    borderColor: "#E05A3F"
  },

  sizeTitle: {
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "2px"
  },

  sizeCapacity: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#E05A3F",
    marginBottom: "8px"
  },

  capacityIcon: {
    color: "#b8b8c8",
    opacity: 0.9
  },

  sizeImageWrap: {
    height: "112px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px"
  },

  sizeImage: {
    maxHeight: "112px",
    maxWidth: "100%",
    objectFit: "contain"
  },

  sizeBadge: {
    width: "64px",
    height: "34px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.6px",
    boxShadow: "0 6px 14px rgba(37,99,235,0.35)"
  },

  definitionWrapper: {
    marginTop: "26px",
    marginBottom: "34px",
    background: "#020617",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "16px",
    overflowX: "auto"
  },

  definitionTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
    color: "#e5e7eb",
    minWidth: "820px"
  },

  definitionHeaderCell: {
    borderBottom: "2px solid #2563eb",
    padding: "12px 10px",
    textAlign: "center",
    fontWeight: "800",
    color: "#ffffff",
    background: "#111827"
  },

  definitionLabelCell: {
    borderBottom: "1px solid #334155",
    padding: "12px 10px",
    textAlign: "left",
    fontWeight: "800",
    color: "#bfdbfe",
    background: "#111827",
    width: "170px"
  },

  definitionCell: {
    borderBottom: "1px solid #334155",
    padding: "12px 10px",
    textAlign: "center",
    color: "#e5e7eb",
    lineHeight: "1.35"
  },

  definitionCellActive: {
    background: "#172554",
    color: "#ffffff",
    fontWeight: "700"
  },

  complexitySelector: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "16px",
    maxWidth: "820px",
    margin: "0 auto"
  },

  complexityCard: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    borderRadius: "16px",
    padding: "16px",
    cursor: "pointer",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    textAlign: "center",
    transition: "all 0.2s ease",
    minHeight: "150px"
  },

  complexityCardActive: {
    border: "2px solid #E05A3F",
    background: "rgba(224,90,63,0.1)",
    boxShadow: "0 10px 24px rgba(224,90,63,0.3)"
  },

  complexityCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 16px 32px rgba(224,90,63,0.2)",
    borderColor: "#E05A3F"
  },

  complexityIconWrap: {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: "8px",
    height: "48px"
  },

  complexityBar: {
    width: "7px",
    borderRadius: "999px",
    transition: "all 0.2s ease"
  },

  levelLabel: {
    fontSize: "11px",
    color: "#b8b8c8",
    marginBottom: "6px"
  },

  complexityCardTitle: {
    fontWeight: "800",
    fontSize: "16px",
    marginBottom: "6px",
    color: "#ffffff"
  },

  complexityCardDescription: {
    fontSize: "12px",
    color: "#b8b8c8",
    lineHeight: "1.4"
  },

  resultWrapper: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "16px",
    flexWrap: "wrap"
  },

  resultTitle: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#ffffff",
    margin: 0,
    lineHeight: "1.25"
  },

  resultHeaderAside: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },

  infoPill: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(224,90,63,0.3)",
    borderRadius: "16px",
    padding: "12px 14px",
    minWidth: "170px",
    boxShadow: "0 16px 36px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  },

  infoPillIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: "rgba(224,90,63,0.15)",
    flexShrink: 0
  },

  sizeChip: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    background: "#E05A3F",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "14px"
  },

  infoPillLabel: {
    fontSize: "11px",
    color: "#b8b8c8",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: "4px"
  },

  infoPillValue: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#ffffff"
  },

  sizeBox: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "22px",
    borderRadius: "14px",
    marginBottom: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },

  sizeBoxTitle: {
    fontWeight: "800",
    fontSize: "18px",
    marginBottom: "10px",
    color: "#ffffff",
    textAlign: "left"
  },

  sizeBoxDesc: {
    fontSize: "14px",
    color: "#d1d5db",
    marginBottom: "16px",
    lineHeight: "1.6"
  },

  sizeBoxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px"
  },

  sizeBoxItem: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    padding: "14px",
    display: "grid",
    gap: "10px"
  },

  sizeBoxHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  sizeBoxIcon: {
    width: "38px",
    height: "38px",
    display: "grid",
    placeItems: "center",
    borderRadius: "12px",
    background: "rgba(224,90,63,0.15)",
    color: "#E05A3F"
  },

  sizeBoxLabel: {
    fontSize: "12px",
    color: "#e5e7eb",
    textTransform: "uppercase",
    letterSpacing: "0.7px"
  },

  sizeBoxValue: {
    fontSize: "15px",
    color: "#ffffff",
    fontWeight: "700"
  },

  badge: {
    background: "#E05A3F",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    flexShrink: 0
  },

  description: {
    marginTop: "10px",
    marginBottom: "24px",
    color: "#b8b8c8",
    lineHeight: "1.6",
    fontSize: "16px",
    textAlign: "left"
  },

  complexityBox: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "22px",
    borderRadius: "14px",
    marginBottom: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },

  complexityTitle: {
    fontWeight: "800",
    fontSize: "18px",
    marginBottom: "10px",
    color: "#ffffff",
    textAlign: "left"
  },

  complexityDesc: {
    fontSize: "14px",
    marginBottom: "16px",
    color: "#b8b8c8",
    lineHeight: "1.6",
    textAlign: "left"
  },

  complexityGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px 18px"
  },

  complexityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "13px",
    color: "#b8b8c8",
    lineHeight: "1.45",
    textAlign: "left"
  },

  complexityDot: {
    width: "7px",
    height: "7px",
    borderRadius: "999px",
    background: "#E05A3F",
    marginTop: "6px",
    flexShrink: 0
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px"
  },

  sectionCard: {
    background: "rgba(255, 255, 255, 0.08)",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },

  sectionTitle: {
    marginBottom: "18px",
    fontWeight: "800",
    fontSize: "18px",
    color: "#ffffff"
  },

  deviceList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  deviceRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },

  deviceIcon: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(224,90,63,0.15)",
    borderRadius: "9px",
    color: "#E05A3F",
    flexShrink: 0
  },

  deviceText: {
    fontSize: "15px",
    color: "#ffffff",
    textTransform: "capitalize"
  },

  pricingCard: {
    background: "rgba(224,90,63,0.08)",
    border: "1px solid rgba(224,90,63,0.3)",
    color: "#ffffff",
    padding: "30px",
    borderRadius: "14px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "260px"
  },

  pricingTitle: {
    fontSize: "13px",
    marginBottom: "16px",
    color: "#b8b8c8",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },

  price: {
    fontSize: "28px",
    fontWeight: "800",
    lineHeight: "1.3"
  },

  priceNote: {
    fontSize: "12px",
    marginTop: "12px",
    opacity: 0.8
  }
};

export default App;