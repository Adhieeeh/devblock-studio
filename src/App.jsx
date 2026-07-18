import React, { useState, useEffect } from 'react';


const computePseudoHash = (index, previousHash, timestamp, data, nonce) => {
  const compositeString = `${index}${previousHash}${timestamp}${JSON.stringify(data)}${nonce}`;
  let hashValue = 0;
  for (let i = 0; i < compositeString.length; i++) {
    const characterCode = compositeString.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + characterCode;
    hashValue = hashValue & hashValue; 
  }
 
  return Math.abs(hashValue).toString(16).padStart(8, '0');
};


const INITIAL_LEDGER = [
  {
    index: 0,
    timestamp: '00:00:00',
    data: { sender: 'SYSTEM', receiver: 'Adhieeeh', amount: 100 },
    previousHash: '00000000',
    nonce: 42,
    hash: '003a5b82'
  }
];

function App() {
  
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  const [miningDifficulty, setMiningDifficulty] = useState(2); 
  const [isMining, setIsMining] = useState(false);
  
  
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState(10);
  
  const [protocolLogs, setProtocolLogs] = useState([' Genesis block validated. Cryptographic chain consensus online.']);

  
  const handleMineBlock = (e) => {
    e.preventDefault();
    if (!sender.trim() || !receiver.trim() || isMining) return;

    setIsMining(true);
    setProtocolLogs(prev => [` LAUNCHING WORKER: Mining block ${ledger.length}...`, ...prev]);

    const targetPrefix = '0'.repeat(miningDifficulty);
    const lastBlock = ledger[ledger.length - 1];
    const newIndex = ledger.length;
    const currentTimestamp = new Date().toLocaleTimeString();
    const payloadData = { sender: sender.trim(), receiver: receiver.trim(), amount: Number(amount) };
    
    let activeNonce = 0;
    
    
    const miningTimer = setInterval(() => {
      const generatedHash = computePseudoHash(newIndex, lastBlock.hash, currentTimestamp, payloadData, activeNonce);
      
      if (generatedHash.startsWith(targetPrefix)) {
        clearInterval(miningTimer);
        
        const validatedBlock = {
          index: newIndex,
          timestamp: currentTimestamp,
          data: payloadData,
          previousHash: lastBlock.hash,
          nonce: activeNonce,
          hash: generatedHash
        };

        setLedger(prev => [...prev, validatedBlock]);
        setIsMining(false);
        setProtocolLogs(prev => [` BLOCK MINED: Nonce matches difficulty [${activeNonce}]. Hash: ${generatedHash}`, ...prev]);
        setSender('');
        setReceiver('');
      } else {
        activeNonce++;
        
        if (activeNonce % 250 === 0) {
          setProtocolLogs(prev => [` Hashing block... Nonce checkpoint at ${activeNonce}`, ...prev.slice(0, 10)]);
        }
      }
    }, 1);
  };

  
  const verifyChainIntegrity = () => {
    for (let i = 1; i < ledger.length; i++) {
      const currentBlock = ledger[i];
      const previousBlock = ledger[i - 1];

     
      if (currentBlock.previousHash !== previousBlock.hash) return false;
      
      
      const verifyCurrentHash = computePseudoHash(
        currentBlock.index, 
        currentBlock.previousHash, 
        currentBlock.timestamp, 
        currentBlock.data, 
        currentBlock.nonce
      );
      if (currentBlock.hash !== verifyCurrentHash) return false;
    }
    return true;
  };

 
  const triggerMaliciousTamper = (targetIndex) => {
    setLedger(prevLedger => 
      prevLedger.map(block => {
        if (block.index === targetIndex) {
          return {
            ...block,
            data: { ...block.data, amount: block.data.amount + 500 }
          };
        }
        return block;
      })
    );
    setProtocolLogs(prev => [` LEDGER ALERT: Malicious balance manipulation injected on block ${targetIndex}!`, ...prev]);
  };

  const isChainValid = verifyChainIntegrity();

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', fontFamily: 'monospace', backgroundColor: '#070a13', color: '#f8fafc', minHeight: '90vh' }}>
      
      {/* HEADER SECTION PANEL */}
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '25px', marginBottom: '35px', gap: '20px' }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#06b6d4', letterSpacing: '-0.5px' }}> DevBlock Cryptographic Ledger Lab</h1>
          <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '12px' }}>An interactive multi-tier blockchain ledger workspace modeling cryptographic consensus loops.</p>
        </div>

        <div>
          <span style={{ 
            fontSize: '12px', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold',
            backgroundColor: isChainValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: isChainValid ? '#10b981' : '#ef4444',
            border: `1px solid ${isChainValid ? '#10b981' : '#ef4444'}`
          }}>
            {isChainValid ? ' CONSENSUS: VALIDATED' : ' CONSENSUS BREACH: TAMPERED'}
          </span>
        </div>
      </header>

      
      <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '25px', borderRadius: '16px', marginBottom: '35px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Distributed Ledger Graph Visualization</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '10px' }}>
          {ledger.map((block, idx) => (
            <React.Fragment key={block.index}>
              
              <div style={{ 
                minWidth: '220px', backgroundColor: '#070a13', border: '1px solid #1e293b', padding: '16px', borderRadius: '10px',
                position: 'relative', borderTop: `4px solid ${idx === 0 ? '#3b82f6' : '#06b6d4'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
                  <span>BLOCK #{block.index}</span>
                  <span>Nonce: {block.nonce}</span>
                </div>
                
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><span style={{ color: '#64748b' }}>From:</span> {block.data.sender}</div>
                  <div><span style={{ color: '#64748b' }}>To:</span> {block.data.receiver}</div>
                  <div><span style={{ color: '#06b6d4', fontWeight: 'bold' }}>Val:</span> {block.data.amount} BTC</div>
                </div>

                <div style={{ fontSize: '10px', color: '#64748b', wordBreak: 'break-all' }}>
                  <div><span style={{ color: '#475569' }}>Prev:</span> {block.previousHash}</div>
                  <div><span style={{ color: '#475569' }}>Hash:</span> <span style={{ color: '#34d399' }}>{block.hash}</span></div>
                </div>

                
                {idx > 0 && (
                  <button 
                    onClick={() => triggerMaliciousTamper(block.index)}
                    style={{ marginTop: '12px', width: '100%', padding: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '4px', fontSize: '9px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                     Tamper Data
                  </button>
                )}
              </div>

             
              {idx < ledger.length - 1 && (
                <div style={{ color: '#1e293b', fontSize: '18px', fontWeight: 'bold' }}>➔</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
       
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '25px', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>Inbound Transaction Pool</h3>
          <form onSubmit={handleMineBlock} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: '1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Sender Address</label>
                <input type="text" placeholder="e.g. Alice" value={sender} disabled={isMining} onChange={(e) => setSender(e.target.value)} style={{ width: '100%', padding: '9px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Receiver Address</label>
                <input type="text" placeholder="e.g. Bob" value={receiver} disabled={isMining} onChange={(e) => setReceiver(e.target.value)} style={{ width: '100%', padding: '9px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ flex: '1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Asset Weight (Amount)</label>
                <input type="number" min="1" value={amount} disabled={isMining} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '9px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px' }}>Difficulty ({miningDifficulty} Zeros)</label>
                <input type="range" min="1" max="4" value={miningDifficulty} disabled={isMining} onChange={(e) => setMiningDifficulty(Number(e.target.value))} style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }} />
              </div>
            </div>

            <button type="submit" disabled={isMining} style={{ padding: '12px', backgroundColor: isMining ? '#1e293b' : '#06b6d4', color: isMining ? '#475569' : '#070a13', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: isMining ? 'not-allowed' : 'pointer', transition: '0.15s', marginTop: '5px' }}>
              {isMining ? ' Mining Block Parameters...' : ' Broadcast & Mine Block'}
            </button>
          </form>
        </section>

       
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Consensus Event Engine Tracker</h3>
          <div style={{ flexGrow: '1', backgroundColor: '#070a13', borderRadius: '12px', padding: '20px', minHeight: '180px', maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {protocolLogs.map((log, index) => (
              <div key={index} style={{ 
                fontSize: '11px', lineHeight: '1.5',
                color: log.startsWith('❌') || log.startsWith('🚨') ? '#f43f5e' : log.startsWith('⚠️') ? '#fbbf24' : log.startsWith('✅') ? '#34d399' : '#64748b'
              }}>
                {log}
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}

export default App;