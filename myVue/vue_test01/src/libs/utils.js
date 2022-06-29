//定义工具函数
function formatToTime(time) {
  var date = new Date(time * 1000); //time为s,转化成ms
  const year = date.getFullYear();
  const month = (date.getMonth()+1).toString().padStart(2,'0');
  const day = date.getDate().toString().padStart(2,'0');
  const hour = date.getHours().toString().padStart(2,'0');
  const minute = date.getMinutes().toString().padStart(2,'0');
  const second = date.getSeconds().toString().padStart(2,'0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
function formatToDate(time) {
  var date = new Date(time * 1000); //time为s,转化成ms
  const year = date.getFullYear();
  const month = (date.getMonth()+1).toString().padStart(2,'0');
  const day = date.getDate().toString().padStart(2,'0');

  return `${year}-${month}-${day}`
}

export default {
  formatToTime,
  formatToDate
}