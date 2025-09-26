
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
          setUrl(urlWithoutHTTP)
          if(urlWithoutHTTP.length<25){
            setShowenUrl(urlWithoutHTTP)
          }else{
            setShowenUrl(urlWithoutHTTP.substring(0,10)+"...\n"+urlWithoutHTTP.substring(urlWithoutHTTP.length - 10 ))
          }
          setAuctionNumber(data.auction_number);
        } else {
          console.error('Failed to fetch QR content, falling back to default.');
          setUrl(defaulttUrl.replace("http://", "").replace("https://", "")); // Fallback URL
          setShowenUrl(defaulttUrl);
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
        <div className="qr-code-container">
          <div className="auction-info">
            <h2># {auctionNumber.toString().padStart(4, '0')}</h2>
          <CountdownDisplay />
        </div>
        <QRCodeCanvas value={`${config.apiUrl}/qr-redirect`} size={256} bgColor="var(" fgColor="rgba(255, 238, 252, 1)" />
        </div>
        <a href={`${url}`} target="_blank" rel="noopener noreferrer">
          {/* {url.substring(0,20)}...{url.substring(url.length - 20 )} */}
          {showenUrl}
          
        </a>
      </div>
  )
}
export default QrColumn;