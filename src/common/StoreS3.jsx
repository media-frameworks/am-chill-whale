import config from "../config/aws.json";

export const S3_PREFIX = 'am-chill-whale';

var AWS = require('aws-sdk');
var s3 = new AWS.S3(config);

export class StoreS3 {

    static list_files_async = (dir = '', prefix = S3_PREFIX, cb) => {
        if (dir.length && dir[dir.length - 1] !== '/') {
            dir += '/';
        }
        const params = {
            Bucket: "mikehallstudio",
            Prefix: prefix + '/' + dir,
            Delimiter: "/"
        };
        s3.listObjects(params, (err, data) => {
            if (err) {
                console.error("List Dir Error", dir);
                cb(err);
            } else {
                cb(data);
            }
        });
    };

    static put_file_async = (name, data, prefix = S3_PREFIX, cb) => {
        const full_key = `${prefix}/${name}`
        const params = {
            Bucket: "mikehallstudio",
            Key: full_key,
            Body: data,
            ACL: "public-read"
        };
        s3.upload(params, (err, data) => {
            if (err) {
                console.error("S3.upload error", err);
                cb(false);
            }
            if (data) {
                console.log("S3.upload", full_key);
                cb(true);
            }
        });
    }

    static get_file_async(name, prefix = S3_PREFIX, cb) {
        const full_key = `${prefix}/${name}`
        const params = {
            Bucket: "mikehallstudio",
            Key: full_key
        };
        s3.getObject(params, (err, data) => {
            const str_data = data.Body.toString('utf-8');
            console.log("s3.getObject", str_data);
            if (err) {
                cb (err)
            } else {
                cb (str_data)
            }
        })
}

    static async get_json_file(file_path, prefix = "manifest") {
        const div_item = await StoreS3.get_file(file_path, prefix).catch(e => {
            console.log("error loading file", file_path);
        })
        return div_item ? JSON.parse(div_item.Body) : [];
    }

    static async get_file_tree(root) {
        const all_files = await StoreS3.list_files(root);
        const file_set = {};
        for (let index = 0; index < all_files.Contents.length; index++) {
            const file = all_files.Contents[index];
            const file_path = file.Key.slice(9);
            const folder_path = file_path.slice(0, file_path.length - 5) + "/";
            if (file_path.slice(file_path.length - 5) === '.json') {
                let file_item = await StoreS3.get_json_file(file_path);
                for (let jndex = 0; jndex < all_files.CommonPrefixes.length; jndex++) {
                    const compare_prefix = all_files.CommonPrefixes[jndex].Prefix.slice(9);
                    if (compare_prefix === folder_path) {
                        file_item.items = await StoreS3.get_file_tree(compare_prefix)
                    }
                }
                delete file_item["created"]
                delete file_item["updated"]
                delete file_item["path"]
                const title = file_item["title"];
                file_set[title] = file_item;
            }
        }
        return file_set;
    }


    static async delete_file(name, prefix = "manifest") {
        const params = {
            Bucket: "mikehallstudio",
            Key: prefix + "/" + name
        };
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.log("Delete file Error", err);
            }
            if (data) {
                console.log("Delete file Success", name);
            }
        });
    }

}

export default StoreS3;