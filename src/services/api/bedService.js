import { toast } from 'react-toastify';

class BedService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'bed_c';
    
    // Define lookup fields for proper handling
    this.lookupFields = ['patient_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { "Name": "Name" } },
          { field: { "Name": "Tags" } },
          { field: { "Name": "ward_name_c" } },
          { field: { "Name": "bed_number_c" } },
          { field: { "Name": "is_occupied_c" } },
          { field: { "Name": "patient_id_c" } },
          { field: { "Name": "admitted_date_c" } },
          { field: { "Name": "CreatedOn" } },
          { field: { "Name": "Owner" } }
        ],
        orderBy: [
          { fieldName: "ward_name_c", sorttype: "ASC" },
          { fieldName: "bed_number_c", sorttype: "ASC" }
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
        console.error("Error fetching beds:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error fetching beds:", error);
        toast.error("Failed to fetch beds");
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
          { field: { "Name": "ward_name_c" } },
          { field: { "Name": "bed_number_c" } },
          { field: { "Name": "is_occupied_c" } },
          { field: { "Name": "patient_id_c" } },
          { field: { "Name": "admitted_date_c" } }
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
        console.error(`Error fetching bed with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching bed with ID ${id}:`, error);
      }
      return null;
    }
  }

  async create(bedData) {
    try {
      // Only include Updateable fields in create operation
      const updateableData = {
        Name: bedData.Name || '',
        Tags: bedData.Tags || '',
        ward_name_c: bedData.ward_name_c || '',
        bed_number_c: bedData.bed_number_c || '',
        is_occupied_c: bedData.is_occupied_c || false,
        patient_id_c: bedData.patient_id_c ? parseInt(bedData.patient_id_c) : null,
        admitted_date_c: bedData.admitted_date_c || null
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
          console.error(`Failed to create ${failedRecords.length} bed records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("Bed created successfully!");
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating bed:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error creating bed:", error);
        toast.error("Failed to create bed");
      }
      return null;
    }
  }

  async update(id, bedData) {
    try {
      // Only include Updateable fields in update operation
      const updateableData = {
        Id: parseInt(id),
        Name: bedData.Name,
        Tags: bedData.Tags,
        ward_name_c: bedData.ward_name_c,
        bed_number_c: bedData.bed_number_c,
        is_occupied_c: bedData.is_occupied_c,
        patient_id_c: bedData.patient_id_c ? parseInt(bedData.patient_id_c) : null,
        admitted_date_c: bedData.admitted_date_c
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
          console.error(`Failed to update ${failedUpdates.length} bed records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("Bed updated successfully!");
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating bed:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error updating bed:", error);
        toast.error("Failed to update bed");
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
          console.error(`Failed to delete ${failedDeletions.length} bed records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success("Bed deleted successfully!");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting bed:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error deleting bed:", error);
        toast.error("Failed to delete bed");
      }
      return false;
    }
  }
}

export default new BedService();