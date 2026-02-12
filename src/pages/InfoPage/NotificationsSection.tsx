import * as React from "react";

interface NotificationsSectionProps {
  savedSearchId: string | null;
  savedSearch: any;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  savedSearchId,
  savedSearch,
}) => {
  const [notifications, setNotifications] = React.useState({
    notifyNewLowestBin: false,
    notifyNewSale: false,
    notifyNewAuction: false,
    notifyAuctionEndingToday: false,
    notifyAuctionEndingSoon: false,
  });

  // Load notification settings when savedSearch changes
  React.useEffect(() => {
    setNotifications({
      notifyNewLowestBin: !!savedSearch?.notifyNewLowestBin,
      notifyNewSale: !!savedSearch?.notifyNewSale,
      notifyNewAuction: !!savedSearch?.notifyNewAuction,
      notifyAuctionEndingToday: !!savedSearch?.notifyAuctionEndingToday,
      notifyAuctionEndingSoon: !!savedSearch?.notifyAuctionEndingSoon,
    });
  }, [savedSearch]);

  const handleToggle = async (notificationType: keyof typeof notifications) => {
    if (!savedSearchId) {
      alert("Please save this search first to configure notifications");
      return;
    }

    const newValue = !notifications[notificationType];

    // Optimistically update UI
    setNotifications((prev) => ({
      ...prev,
      [notificationType]: newValue,
    }));

    try {
      const response = await fetch(`http://localhost:3001/api/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: parseInt(savedSearchId),
          notificationType,
          enabled: newValue,
        }),
      });

      if (!response.ok) {
        // Revert on failure
        setNotifications((prev) => ({
          ...prev,
          [notificationType]: !newValue,
        }));
        const data = await response.json();
        alert("Failed to update notification setting: " + data.error);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      // Revert on failure
      setNotifications((prev) => ({
        ...prev,
        [notificationType]: !newValue,
      }));
      alert("Failed to update notification setting.");
    }
  };

  const notificationOptions = [
    { key: 'notifyNewLowestBin' as const, label: 'New Lowest BIN' },
    { key: 'notifyNewSale' as const, label: 'New Sale' },
    { key: 'notifyNewAuction' as const, label: 'New Auction' },
    { key: 'notifyAuctionEndingToday' as const, label: 'Auction Ending Today' },
    { key: 'notifyAuctionEndingSoon' as const, label: 'Auction Ending Soon' },
  ];

  return (
    <div className="border border-gray-300 rounded-lg bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 mt-0">Notifications</h3>

      <div className="grid grid-cols-2 gap-3">
        {notificationOptions.map((option) => (
          <label key={option.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications[option.key]}
              onChange={() => handleToggle(option.key)}
              disabled={!savedSearchId}
              className="w-4 h-4 cursor-pointer"
            />
            <div className="text-sm font-medium text-gray-900">
              {option.label}
            </div>
          </label>
        ))}
      </div>

      {!savedSearchId && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          Save this search to enable notifications
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
