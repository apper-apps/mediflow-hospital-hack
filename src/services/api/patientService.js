import { toast } from 'react-toastify';

class PatientService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'patient_c';
    
    // Define lookup fields for proper handling
    this.lookupFields = ['patient_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { "Name": "Name" } },
          { field: { "Name": "Tags" } },
          { field: { "Name": "age_c" } },
          { field: { "Name": "gender_c" } },
          { field: { "Name": "phone_c" } },
          { field: { "Name": "emergency_contact_c" } },
          { field: { "Name": "blood_group_c" } },
          { field: { "Name": "allergies_c" } },
          { field: { "Name": "current_department_c" } },
          { field: { "Name": "status_c" } },
          { field: { "Name": "admission_date_c" } },
          { field: { "Name": "CreatedOn" } },
          { field: { "Name": "Owner" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
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
        console.error("Error fetching patients:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error fetching patients:", error);
        toast.error("Failed to fetch patients");
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
          { field: { "Name": "age_c" } },
          { field: { "Name": "gender_c" } },
          { field: { "Name": "phone_c" } },
          { field: { "Name": "emergency_contact_c" } },
          { field: { "Name": "blood_group_c" } },
          { field: { "Name": "allergies_c" } },
          { field: { "Name": "current_department_c" } },
          { field: { "Name": "status_c" } },
          { field: { "Name": "admission_date_c" } }
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
        console.error(`Error fetching patient with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching patient with ID ${id}:`, error);
      }
      return null;
    }
  }

  async create(patientData) {
    try {
      // Only include Updateable fields in create operation
const updateableData = {
        Name: patientData.Name || '',
        Tags: patientData.Tags || '',
        age_c: parseInt(patientData.age_c) || 0,
        gender_c: patientData.gender_c || '',
        phone_c: patientData.phone_c || '',
        emergency_contact_c: patientData.emergency_contact_c || '',
        blood_group_c: patientData.blood_group_c || '',
        allergies_c: patientData.allergies_c || '',
        current_department_c: patientData.current_department_c || '',
        status_c: patientData.status_c || 'waiting',
        admission_date_c: patientData.admission_date_c || new Date().toISOString()
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
          console.error(`Failed to create ${failedRecords.length} patient records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("Patient created successfully!");
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating patient:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error creating patient:", error);
        toast.error("Failed to create patient");
      }
      return null;
    }
  }

  async update(id, patientData) {
    try {
// Only include Updateable fields in update operation
      const updateableData = {
        Id: parseInt(id),
        Name: patientData.Name,
        Tags: patientData.Tags,
        age_c: parseInt(patientData.age_c),
        gender_c: patientData.gender_c,
        phone_c: patientData.phone_c,
        emergency_contact_c: patientData.emergency_contact_c,
        blood_group_c: patientData.blood_group_c,
        allergies_c: patientData.allergies_c,
        current_department_c: patientData.current_department_c,
        status_c: patientData.status_c,
        admission_date_c: patientData.admission_date_c
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
          console.error(`Failed to update ${failedUpdates.length} patient records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("Patient updated successfully!");
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating patient:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error updating patient:", error);
        toast.error("Failed to update patient");
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
          console.error(`Failed to delete ${failedDeletions.length} patient records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success("Patient deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting patient:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error deleting patient:", error);
        toast.error("Failed to delete patient");
      }
      return false;
    }
  }
}

export default new PatientService();