
import React, { FC, useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import config from '../../settings';
import { useCountdown } from '../../hooks/useCountdown';
import './QrColumn.css';
import { set } from '@coral-xyz/anchor/dist/cjs/utils/features';

function QrColumn(){
  const [url, setUrl] = useState('');
  const [showenUrl, setShowenUrl] = useState('');
  const [auctionNumber, setAuctionNumber] = useState(0);
  const timeLeft = useCountdown();
  const [defaulttUrl] = useState("https://" + config.apiUrl?.replace("http://","").replace("https://",""));  
  const CountdownDisplay: FC = () => {
    const { hours, minutes, seconds } = timeLeft;
    const formatTime = (num: number) => num.toString().padStart(2, '0');

    return (
      <p>Time left: {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}</p>
    );
  };
    useEffect(() => {
    const fetchQrContent = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/latest-qr-content`);
        if (response.ok) {
          const data = await response.json();
          const urlWithoutHTTP = data.url.replace("http://", "").replace("https://", "");
          setUrl("https://"+urlWithoutHTTP)
          if(urlWithoutHTTP.length<25){
            setShowenUrl(urlWithoutHTTP)
          }
          else{
            setShowenUrl(urlWithoutHTTP.substring(0,10)+"...\n"+urlWithoutHTTP.substring(urlWithoutHTTP.length - 10 ))
          }
          setAuctionNumber(data.auction_number+1);
        } else {
          console.error('Failed to fetch QR content, falling back to default.');
          setUrl(defaulttUrl); // Fallback URL
          setShowenUrl(defaulttUrl);
          setAuctionNumber(1)
        }
      }
      catch (error) {
        console.error('Error fetching QR content, falling back to default:', error);
        setUrl(defaulttUrl); // Fallback URL
        setShowenUrl(defaulttUrl);
      }
      
    };

    fetchQrContent();
  }, []);
  return(
      <div className="sidebar">
        {/* Actual Auction Section */}
        <div className="actual-auction-section">
          <h3>Current Auction</h3>
          <div className="auction-info">
            <h2># {auctionNumber.toString().padStart(4, '0')}</h2>
            <CountdownDisplay />
          </div>
        </div>

        {/* Past Auction Section */}
        <div className="past-auction-section">
          <h3>Past Auction</h3>
          <div className="qr-code-container">
            <QRCodeCanvas value={`${config.apiUrl}/qr-redirect`} size={256} bgColor="var(" fgColor="rgba(255, 238, 252, 1)" />
          </div>
          <a href={`${url}`} target="_blank" rel="noopener noreferrer">
            {showenUrl}
          </a>
        </div>
      </div>
  )
}
export default QrColumn;