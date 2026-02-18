import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeModal: null,
    modalData: null,
    sidebarOpen: false,
    timePeriod: {
      type: 'month',
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    },
  },
  reducers: {
    openModal: (state, action) => {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTimePeriod: (state, action) => {
      state.timePeriod = action.payload;
    },
    nextMonth: (state) => {
      if (state.timePeriod.month === 11) {
        state.timePeriod.month = 0;
        state.timePeriod.year += 1;
      } else {
        state.timePeriod.month += 1;
      }
    },
    previousMonth: (state) => {
      if (state.timePeriod.month === 0) {
        state.timePeriod.month = 11;
        state.timePeriod.year -= 1;
      } else {
        state.timePeriod.month -= 1;
      }
    },
  },
});

export const {
  openModal,
  closeModal,
  toggleSidebar,
  setTimePeriod,
  nextMonth,
  previousMonth,
} = uiSlice.actions;

export default uiSlice.reducer;
