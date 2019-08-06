/**
 * Thiết kế database cho 1 hệ thống quản lý thư viện sách, cho biết thư viện này có hàng trăm giá sách khác nhau, sách được để ở bất kì giá nào không theo danh mục nào.
 * Mỗi cuốn sách có 1 mã khác nhau.
 * Hệ thống cho phép đăng ký người dùng mới, một người có thể mượn nhiều sách khác nhau trong một khoảng thời gian hữu hạn.
 * Hệ thống có thể lưu lịch sử ai đã mượn sách nào, bắt đầu mượn từ bao lâu, trả lúc nào.
 * Hệ thống có lưu lại số ngày quá hạn tổng cộng của 1 người dùng, ví dụ sách A quá 2 ngày, sách B quá 3 ngày -> tổng 5 ngày
 */
var fs = require('fs');
var readlineSync = require('readline-sync');
const { table } = require('table');

var data = [];
var output = [['Id', 'Name', 'Situation', 'User', 'Borrowed Day', 'Paid Day', 'Overtime']];

function loadDate() {
  dataFile = fs.readFileSync("./data.json");
  data = JSON.parse(dataFile);
  listOfBook = data.book;
}

function showMenu() {
  console.log("0. Show all books");
  console.log("1. Create a book");
  console.log("3. Search a book");
  var option = readlineSync.question("> ");
  switch (option) {
    case '0':
      showAllBooks();
      break;
    case '1':
      showCreateBook();
      showMenu();
      break;
    
    default:
      console.log("Option wrong");
      showMenu();
      break;
  }
}

function showAllBooks() {
  var list = [];
  for (var book of data.book) {
    list.push([
      book.id,
      book.name,
      book.situation,
      book.user,
      book.borrowedDay,
      book.paidDay,
      book.overTime]);
  }
  output = table(output.concat(list));
  console.log(output);
}

function showCreateBook() {
  var name = readlineSync.question("> The name of book: ");
  var newBook = {};
  newBook.id = data.length;
  newBook.name = name;
  newBook.situation = true;
  newBook.user = null;
  newBook.borrowedDay = null;
  newBook.paidDay = null;
  newBook.overTime = null;
  data.book.push(newBook);
}


function run() {
  loadDate();
  showMenu();
}

run();