import React, { useEffect } from 'react';
import { Modal } from 'antd';

interface ModalShowContractInfoProps {
  contractInfo: any;
  visible: boolean;
  onClose: () => void;
}
interface AuctionToShow {
  authority: string;
  new_content: string;
  old_content: string;
  end_timestamp: Date;
  highest_bid: number;
  highest_bidder: string;
  is_active: boolean;
}
const ModalShowContractInfo: React.FC<ModalShowContractInfoProps> = ({ contractInfo, visible, onClose }) => {
  const [auction, setAuction] = React.useState<AuctionToShow | null>(null);
  useEffect(() => {
    if (contractInfo) {
      setAuction({
        authority: contractInfo.authority.toBase58(),
        new_content: contractInfo.newContent,
        old_content: contractInfo.oldContent,
        end_timestamp: new Date(contractInfo.endTimestamp.toNumber() * 1000),
        highest_bid: contractInfo.highestBid.toNumber(),
        highest_bidder: contractInfo.highestBidder.toBase58(),
        is_active: contractInfo.isActive,
      });
      console.log(contractInfo);
    }
  }, [contractInfo]);
  return (
    <Modal
      title="Contract Information"
      visible={visible}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {contractInfo && (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {JSON.stringify(auction, null, 2)}
        </pre>
      )}
    </Modal>
  );
};

export default ModalShowContractInfo;
