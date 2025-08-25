export const getCurrentDateTime = () => {
    var currentdate = new Date();
    return (
        currentdate.getFullYear() +
        '/' +
        (currentdate.getMonth() + 1) +
        '/' +
        currentdate.getDate() +
        ' @ ' +
        currentdate.getHours() +
        ':' +
        currentdate.getMinutes() +
        ':' +
        currentdate.getSeconds()
    );
};
