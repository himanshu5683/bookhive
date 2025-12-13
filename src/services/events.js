import { eventsService } from './api';

// Service to fetch all events
export const getAllEvents = async (params = {}) => {
  try {
    const response = await eventsService.getAll(params);
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Service to fetch a specific event
export const getEventById = async (id) => {
  try {
    const response = await eventsService.getById(id);
    return response;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Service to create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await eventsService.create(eventData);
    return response;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Service to update an event
export const updateEvent = async (id, updateData) => {
  try {
    const response = await eventsService.update(id, updateData);
    return response;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Service to delete an event
export const deleteEvent = async (id) => {
  try {
    const response = await eventsService.delete(id);
    return response;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export default {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};