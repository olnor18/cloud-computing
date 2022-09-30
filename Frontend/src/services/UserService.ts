import constansts from '../common/Constants';

export default class UserService {

  private static serverBaseURL = `${constansts.serverBaseURL}/users`;

  public static async getUserIdFromLocalStorage(): Promise<string | undefined> {
    try {
      const value = localStorage.getItem('@user_id');
      
      if(value !== null) {
        return value;
      }

      return undefined;
    } catch(error) {
      //console.log(error);
      return undefined;
    }
  }

  public static async setLocalStorageUserId(id: string): Promise<void> { 
    try {
      localStorage.setItem('@user_id', id)
    } catch (error) {
      //console.log(error);
    }
  }

  public static getUploadedStatusFromLocalStorage(): boolean { 
    try {
      const value = localStorage.getItem('@uploaded_status');
      
      if(value !== null) {
        return value === 'true';
      }

      return false;
    } catch(error) {
      //console.log(error);
      return false;
    }
  }

  public static setLocalStorageUploadedStatus(status: boolean): void {
    try {
      localStorage.setItem('@uploaded_status', status.toString());
    } catch (error) {
      //console.log(error);
    }
  }

  public static registerUser = async (): Promise<string> => {
    try {
      const connectedTime = +(new Date());
  
      const response = await fetch(`${this.serverBaseURL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectedTime,
        })
      });
  
      if (!response.ok) throw new Error('Failed to register user'); 
  
      const data = await response.json();
      const userId = data.userId;
  
      return userId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static addVideoIdToUser = async (user_id: string, video_id: string): Promise<boolean> => {
    try {
      let response = await fetch(`${this.serverBaseURL}/${user_id}/video`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video_id,
        })
      });
      
      if (response.status === 200) {
        return true;
      }
    }
    catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(error);
      }
    }
    
    return false;
  };

  public static addEmotionsToUser = async (user_id: string, emotions: {
    expression: string;
    probability: number;
  }[][]): Promise<boolean> => {
    try {
      let response = await fetch(`${this.serverBaseURL}/${user_id}/emotions`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotions,
        })
      });

      if (response.ok) {
        return true;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(error);
      }
    }

    return false;
  };

  public static disconnectUser = async (user_id: string): Promise<boolean> => {
    try {
      let response = await fetch(`${this.serverBaseURL}/${user_id}/disconnect`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disconnectedTIme: +(new Date()),
        })
      });
      
      if (response.status === 200) {
        return true;
      }
    }
    catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(error);
      }
    }
    
    return false;
  }
}
