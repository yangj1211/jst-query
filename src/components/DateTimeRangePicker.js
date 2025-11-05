import React, { useState, useRef, useEffect } from 'react';
import './DateTimeRangePicker.css';

const DateTimeRangePicker = ({ value, onChange, placeholder = '选择时间范围' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('start'); // 'start' 或 'end'
  const [startDate, setStartDate] = useState(value?.startDate || null);
  const [endDate, setEndDate] = useState(value?.endDate || null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef(null);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const secondScrollRef = useRef(null);

  // 同步外部value变化
  useEffect(() => {
    if (value) {
      setStartDate(value.startDate || null);
      setEndDate(value.endDate || null);
    }
  }, [value]);

  // 格式化日期时间为字符串
  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 解析日期时间字符串
  const parseDateTime = (str) => {
    if (!str) return null;
    const match = str.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match.map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  // 获取当前选择的日期
  const getCurrentDate = () => {
    const date = currentView === 'start' ? startDate : endDate;
    return date || new Date();
  };

  // 获取当前显示的时间
  const getCurrentTime = () => {
    const date = getCurrentDate();
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    };
  };

  // 滚动到指定时间
  const scrollToTime = (type, value) => {
    let scrollRef;
    if (type === 'hour') {
      scrollRef = hourScrollRef;
    } else if (type === 'minute') {
      scrollRef = minuteScrollRef;
    } else if (type === 'second') {
      scrollRef = secondScrollRef;
    }

    if (scrollRef && scrollRef.current) {
      const optionHeight = 32; // 每个选项的高度（包括padding）
      const scrollTop = value * optionHeight - scrollRef.current.clientHeight / 2 + optionHeight / 2;
      scrollRef.current.scrollTop = Math.max(0, scrollTop);
    }
  };

  // 当打开选择器时，设置当前月份为选中日期的月份，并滚动到选中时间
  useEffect(() => {
    if (isOpen) {
      const currentDate = getCurrentDate();
      setCurrentMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      
      // 滚动到选中的时间
      setTimeout(() => {
        const time = getCurrentTime();
        scrollToTime('hour', time.hour);
        scrollToTime('minute', time.minute);
        scrollToTime('second', time.second);
      }, 100);
    }
  }, [isOpen, currentView, startDate, endDate]);

  // 更新日期
  const updateDate = (day) => {
    const currentDate = getCurrentDate();
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds()
    );
    
    if (currentView === 'start') {
      setStartDate(newDate);
    } else {
      setEndDate(newDate);
    }
  };

  // 更新时间
  const updateTime = (type, value) => {
    const currentDate = getCurrentDate();
    const newDate = new Date(currentDate);
    
    if (type === 'hour') {
      newDate.setHours(value);
    } else if (type === 'minute') {
      newDate.setMinutes(value);
    } else if (type === 'second') {
      newDate.setSeconds(value);
    }
    
    if (currentView === 'start') {
      setStartDate(newDate);
    } else {
      setEndDate(newDate);
    }
  };

  // 获取月份的第一天是星期几（0=星期日, 1=星期一, ...）
  const getFirstDayOfMonth = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // 转换为周一=1
  };

  // 获取月份的天数
  const getDaysInMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  };

  // 获取上个月的最后几天
  const getPrevMonthDays = () => {
    const firstDay = getFirstDayOfMonth();
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    const daysInPrevMonth = prevMonth.getDate();
    const days = [];
    for (let i = firstDay - 1; i > 0; i--) {
      days.push(daysInPrevMonth - i + 1);
    }
    return days;
  };

  // 获取当前月份的日期
  const getCurrentMonthDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // 获取下个月的前几天
  const getNextMonthDays = () => {
    const firstDay = getFirstDayOfMonth();
    const daysInMonth = getDaysInMonth();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const days = [];
    for (let i = 1; i <= totalCells - firstDay - daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // 检查日期是否被选中
  const isDateSelected = (day) => {
    const currentDate = getCurrentDate();
    return (
      currentDate.getFullYear() === currentMonth.getFullYear() &&
      currentDate.getMonth() === currentMonth.getMonth() &&
      currentDate.getDate() === day
    );
  };

  // 确认选择
  const handleConfirm = () => {
    if (startDate && endDate && startDate > endDate) {
      alert('开始时间不能晚于结束时间');
      return;
    }
    onChange && onChange({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });
    setIsOpen(false);
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // 当打开选择器时，设置当前月份为选中日期的月份，并滚动到选中时间
  useEffect(() => {
    if (isOpen) {
      const currentDate = getCurrentDate();
      setCurrentMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      
      // 滚动到选中的时间
      setTimeout(() => {
        const time = getCurrentTime();
        scrollToTime('hour', time.hour);
        scrollToTime('minute', time.minute);
        scrollToTime('second', time.second);
      }, 100);
    }
  }, [isOpen, currentView, startDate, endDate]);

  // 生成时间选项
  const generateTimeOptions = (type) => {
    const options = [];
    if (type === 'hour') {
      for (let i = 0; i < 24; i++) {
        options.push(i);
      }
    } else if (type === 'minute' || type === 'second') {
      for (let i = 0; i < 60; i++) {
        options.push(i);
      }
    }
    return options;
  };

  const displayText = startDate && endDate
    ? `${formatDateTime(startDate)} → ${formatDateTime(endDate)}`
    : startDate
    ? `${formatDateTime(startDate)} → 结束时间`
    : endDate
    ? `开始时间 → ${formatDateTime(endDate)}`
    : placeholder;

  return (
    <div className="datetime-range-picker-wrapper" ref={pickerRef}>
      <div
        className="datetime-range-picker-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="datetime-label">时间</span>
        <input
          type="text"
          readOnly
          value={displayText}
          placeholder={placeholder}
          className="datetime-input"
        />
        {startDate && endDate && (
          <button
            className="datetime-clear-btn"
            onClick={(e) => {
              e.stopPropagation();
              setStartDate(null);
              setEndDate(null);
              onChange && onChange({ startDate: null, endDate: null });
            }}
          >
            ✕
          </button>
        )}
        <span className="datetime-arrow">→</span>
        <span className="datetime-label">结束时间</span>
        <svg className="datetime-calendar-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v2h8V4H4zm0 4v4h8V8H4z"/>
        </svg>
      </div>

      {isOpen && (
        <div className="datetime-range-picker-dropdown">
          <div className="datetime-picker-header">
            <button
              className="datetime-tab"
              onClick={() => setCurrentView('start')}
              data-active={currentView === 'start'}
            >
              开始时间
            </button>
            <button
              className="datetime-tab"
              onClick={() => setCurrentView('end')}
              data-active={currentView === 'end'}
            >
              结束时间
            </button>
          </div>

          <div className="datetime-picker-content">
            {/* 日历部分 */}
            <div className="datetime-calendar-section">
              <div className="calendar-header">
                <button
                  className="calendar-nav-btn"
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setFullYear(newMonth.getFullYear() - 1);
                    setCurrentMonth(newMonth);
                  }}
                >
                  ««
                </button>
                <button
                  className="calendar-nav-btn"
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() - 1);
                    setCurrentMonth(newMonth);
                  }}
                >
                  «
                </button>
                <span className="calendar-month-year">
                  {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                </span>
                <button
                  className="calendar-nav-btn"
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() + 1);
                    setCurrentMonth(newMonth);
                  }}
                >
                  »
                </button>
                <button
                  className="calendar-nav-btn"
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setFullYear(newMonth.getFullYear() + 1);
                    setCurrentMonth(newMonth);
                  }}
                >
                  »»
                </button>
              </div>

              <div className="calendar-weekdays">
                {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                  <div key={index} className="calendar-weekday">{day}</div>
                ))}
              </div>

              <div className="calendar-days">
                {getPrevMonthDays().map((day) => (
                  <div key={`prev-${day}`} className="calendar-day prev-month">
                    {day}
                  </div>
                ))}
                {getCurrentMonthDays().map((day) => (
                  <div
                    key={day}
                    className={`calendar-day ${isDateSelected(day) ? 'selected' : ''}`}
                    onClick={() => updateDate(day)}
                  >
                    {day}
                  </div>
                ))}
                {getNextMonthDays().map((day) => (
                  <div key={`next-${day}`} className="calendar-day next-month">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* 时间选择部分 */}
            <div className="datetime-time-section">
              <div className="time-header">
                {formatDateTime(getCurrentDate()).split(' ')[1]}
              </div>
              <div className="time-picker-columns">
                <div className="time-column">
                  <div className="time-scroll" ref={hourScrollRef}>
                    {generateTimeOptions('hour').map((hour) => {
                      const currentTime = getCurrentTime();
                      return (
                        <div
                          key={hour}
                          className={`time-option ${currentTime.hour === hour ? 'selected' : ''}`}
                          onClick={() => updateTime('hour', hour)}
                        >
                          {String(hour).padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="time-column">
                  <div className="time-scroll" ref={minuteScrollRef}>
                    {generateTimeOptions('minute').map((minute) => {
                      const currentTime = getCurrentTime();
                      return (
                        <div
                          key={minute}
                          className={`time-option ${currentTime.minute === minute ? 'selected' : ''}`}
                          onClick={() => updateTime('minute', minute)}
                        >
                          {String(minute).padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="time-column">
                  <div className="time-scroll" ref={secondScrollRef}>
                    {generateTimeOptions('second').map((second) => {
                      const currentTime = getCurrentTime();
                      return (
                        <div
                          key={second}
                          className={`time-option ${currentTime.second === second ? 'selected' : ''}`}
                          onClick={() => updateTime('second', second)}
                        >
                          {String(second).padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="datetime-picker-footer">
            <button className="datetime-confirm-btn" onClick={handleConfirm}>
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeRangePicker;

