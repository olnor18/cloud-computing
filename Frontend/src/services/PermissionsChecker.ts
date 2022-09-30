export class PermissionChecker {
    public static async isGeolocationGranted() {
        if (navigator.permissions) {
            const serviceGrantedStatus = await navigator.permissions.query({
                name: "geolocation"
            });

            return serviceGrantedStatus.state === "granted";
        }

        return false;
    }

    public static async isCameraGranted() {
        if (navigator.mediaDevices) {
            const res = await navigator.mediaDevices.enumerateDevices().then(devices => {
                
                let status = false;
                devices.forEach(device => {
                    if (device.label.length > 0) {
                        status = true;
                    }
                });

                return status;
            }).catch(() => {
                return false;
            });

            return res;
        }

        return false;       
    }
}
