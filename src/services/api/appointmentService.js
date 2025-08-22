import { toast } from 'react-toastify';

class AppointmentService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'appointment_c';
    
    // Define lookup fields for proper handling
    this.lookupFields = ['patient_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { "Name": "Name" } },
          { field: { "Name": "Tags" } },
          { field: { "Name": "doctor_id_c" } },
          { field: { "Name": "department_c" } },
          { field: { "Name": "date_c" } },
          { field: { "Name": "time_slot_c" } },
          { field: { "Name": "status_c" } },
          { field: { "Name": "notes_c" } },
          { field: { "Name": "patient_id_c" } },
          { field: { "Name": "CreatedOn" } },
          { field: { "Name": "Owner" } }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching appointments:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to fetch appointments");
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { "Name": "Name" } },
          { field: { "Name": "Tags" } },
          { field: { "Name": "doctor_id_c" } },
          { field: { "Name": "department_c" } },
          { field: { "Name": "date_c" } },
          { field: { "Name": "time_slot_c" } },
          { field: { "Name": "status_c" } },
          { field: { "Name": "notes_c" } },
          { field: { "Name": "patient_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching appointment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching appointment with ID ${id}:`, error);
      }
      return null;
    }
  }

  async create(appointmentData) {
    try {
      // Only include Updateable fields in create operation
      const updateableData = {
        Name: appointmentData.Name || '',
        Tags: appointmentData.Tags || '',
        doctor_id_c: appointmentData.doctor_id_c || '',
        department_c: appointmentData.department_c || '',
        date_c: appointmentData.date_c || '',
        time_slot_c: appointmentData.time_slot_c || '',
        status_c: appointmentData.status_c || 'scheduled',
        notes_c: appointmentData.notes_c || '',
        patient_id_c: parseInt(appointmentData.patient_id_c) || null
      };

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} appointment records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("Appointment created successfully!");
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating appointment:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error creating appointment:", error);
        toast.error("Failed to create appointment");
      }
      return null;
    }
  }

  async update(id, appointmentData) {
    try {
      // Only include Updateable fields in update operation
      const updateableData = {
        Id: parseInt(id),
        Name: appointmentData.Name,
        Tags: appointmentData.Tags,
        doctor_id_c: appointmentData.doctor_id_c,
        department_c: appointmentData.department_c,
        date_c: appointmentData.date_c,
        time_slot_c: appointmentData.time_slot_c,
        status_c: appointmentData.status_c,
        notes_c: appointmentData.notes_c,
        patient_id_c: parseInt(appointmentData.patient_id_c) || null
      };

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} appointment records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("Appointment updated successfully!");
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating appointment:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error updating appointment:", error);
        toast.error("Failed to update appointment");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} appointment records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success("Appointment deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting appointment:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error deleting appointment:", error);
        toast.error("Failed to delete appointment");
      }
      return false;
    }
  }
}

export default new AppointmentService();