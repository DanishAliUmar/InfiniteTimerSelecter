import React, { useState, useRef, useEffect } from 'react';
import './Timer.css';

const Timer = ({ onTimeUpdate, staticMinutes = null, staticSeconds = null }) => {
    const [selectedMinutes, setSelectedMinutes] = useState(staticMinutes ?? 0);
    const [selectedSeconds, setSelectedSeconds] = useState(staticSeconds ?? 0);

    const minutesRef = useRef(null);
    const secondsRef = useRef(null);

    const totalItems = 60; // Total number of minutes/seconds (0 to 59)
    const itemHeight = 50; // Height of each scroll item
    const bufferItems = 10; // Extra items at the top and bottom for infinite scroll illusion

    // Function to handle magnetic scroll effect
    const handleMagneticScroll = (ref, setter) => {
        if (staticMinutes !== null && staticSeconds !== null) return;  // If static, don't use scroll
        const container = ref.current;
        const items = container.querySelectorAll('.scroll-item');
        const containerCenter = container.getBoundingClientRect().top + container.clientHeight / 2;

        let closestItem = null;
        let closestDistance = Infinity;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(containerCenter - itemCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        });

        if (closestItem) {
            const closestIndex = parseInt(closestItem.textContent);
            setter(closestIndex);
            container.scrollTo({
                top: closestItem.offsetTop - container.clientHeight / 2 + closestItem.clientHeight / 2,
                behavior: 'smooth',
            });
        }
    };

    // Scroll listener to trigger the magnetic effect
    const handleScrollStop = (ref, setter) => {
        let scrollTimeout;
        const onScroll = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => handleMagneticScroll(ref, setter), 100);
        };

        const container = ref.current;
        container.addEventListener('scroll', onScroll);
        return () => container.removeEventListener('scroll', onScroll);
    };

    // Infinite scroll behavior
    const handleInfiniteScroll = (ref) => {
        if (staticMinutes !== null && staticSeconds !== null) return;  // If static, don't scroll
        const container = ref.current;
        const maxScrollTop = container.scrollHeight - container.clientHeight;

        if (container.scrollTop <= 0) {
            container.scrollTop = maxScrollTop - itemHeight * bufferItems;
        } else if (container.scrollTop >= maxScrollTop - itemHeight * bufferItems) {
            container.scrollTop = itemHeight * bufferItems;
        }
    };

    useEffect(() => {
        if (staticMinutes !== null && staticSeconds !== null) return;  // If static, don't use scroll
        const minutesContainer = minutesRef.current;
        const secondsContainer = secondsRef.current;

        const handleMinutesScroll = () => handleInfiniteScroll(minutesRef);
        const handleSecondsScroll = () => handleInfiniteScroll(secondsRef);

        minutesContainer.addEventListener('scroll', handleMinutesScroll);
        secondsContainer.addEventListener('scroll', handleSecondsScroll);

        return () => {
            minutesContainer.removeEventListener('scroll', handleMinutesScroll);
            secondsContainer.removeEventListener('scroll', handleSecondsScroll);
        };
    }, [staticMinutes, staticSeconds]);

    useEffect(() => {
        if (staticMinutes !== null && staticSeconds !== null) return;  // If static, don't use scroll
        const cleanupMinutes = handleScrollStop(minutesRef, setSelectedMinutes);
        const cleanupSeconds = handleScrollStop(secondsRef, setSelectedSeconds);

        return () => {
            cleanupMinutes();
            cleanupSeconds();
        };
    }, [staticMinutes, staticSeconds]);

    useEffect(() => {
        if (onTimeUpdate) {
            onTimeUpdate(selectedMinutes, selectedSeconds);
        }
    }, [selectedMinutes, selectedSeconds]);

    useEffect(() => {
        if (minutesRef.current && secondsRef.current && staticMinutes === null && staticSeconds === null) {
            setTimeout(() => {
                const containerHeight = minutesRef.current.clientHeight;
                const initialScrollPosition = bufferItems * itemHeight - containerHeight / 2 + itemHeight / 2;
                minutesRef.current.scrollTop = initialScrollPosition;
                secondsRef.current.scrollTop = initialScrollPosition;
            }, 0);
        }
    }, [staticMinutes, staticSeconds]);

    // Generate items for scrolling with buffer items for infinite scroll
    const generateItems = (count) => {
        const items = [];
        for (let i = -bufferItems; i < count + bufferItems; i++) {
            const index = (i + count) % count;
            items.push(
                <div key={i} className="scroll-item" style={{ height: `${itemHeight}px` }}>
                    {index}
                </div>
            );
        }
        return items;
    };`

    return (
        <div className='bg-slate-100 flex items-center justify-center w-screen h-screen'>
            <div className="timer-container">
                <div className="scrollable !mx-0" ref={minutesRef}>
                    {generateItems(totalItems)}
                </div>
                <div className="scrollable !mx-0" ref={secondsRef}>
                    {generateItems(totalItems)}
                </div>
                <div className="flex items-center justify-between h-[50px] absolute text-white bg-black w-full left-0 top-1/2 -translate-y-1/2">
                    <div className="minutes flex-1 flex items-center justify-end">
                        <div className="center-content">
                            <span>{selectedMinutes}</span> <span className='text-xs text-slate-400 pr-1'>Min</span>
                        </div>
                    </div>
                    <div className="seconds flex-1 flex items-center justify-end">
                        <div className="center-content">
                            <span>{selectedSeconds}</span> <span className='text-xs text-slate-400 pr-1'>Sec</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timer;
