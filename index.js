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
var titleOfColumnBook = [['Id', 'Name', 'Situation', 'User', 'Borrowed Day', 'Paid Day', 'Overtime']];
var titleOfColumnUser = [['Id', 'Name', 'Borrowed Book']];
var output;

function loadDate() {
  dataFile = fs.readFileSync("./data.json");
  data = JSON.parse(dataFile);
  listOfBook = data.book;
}

function showMenu() {
  console.log("0. Show all books");
  console.log("1. Show all user");
  console.log("2. Create a book");
  console.log("3. Create a user");
  console.log("4. Search a book");
  console.log("5. Search a user");
  console.log("6. Borrow a book");
  console.log("7. Pay a book");
  console.log("8. Delete a book");
  console.log("9. Delete a user");
  console.log("10. Save and Exit");
  var option = readlineSync.question("> ");
  switch (option) {
    case '0':
      showAllBooks();
      showMenu();
      break;
    case '1':
      showAllUser();
      showMenu();
      break;
    case '2':
      showCreateBook();
      showMenu();
      break;
    case '3':
      showCreateUser();
      break;
    case '4':
      var result = showSearchBook();
      if (result !== []) {
        output = table(titleOfColumnBook.concat(result));
        console.log(output);
      } else {
        console.log('No book');
      }
      showMenu();
      break;
    case '5':
      var result = showSearchUser();
      if (result !== []) {
        output = table(titleOfColumnUser.concat(result));
        console.log(output);
      } else {
        console.log('No user');
      }
      showMenu();
      break;
    
    default:
      console.log('Option wrong');
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
  output = table(titleOfColumnBook.concat(list));
  console.log(output);
}

function showAllUser() {
  var list = [];
  for (var user of data.user) {
    list.push([
      user.id,
      user.name,
      user.book
    ]);
  }
  output = table(titleOfColumnUser.concat(list));
  console.log(output);
}

function showCreateBook() {
  var name = readlineSync.question("> The name of book: ");
  var newBook = {};
  newBook.id = data.book.length;
  newBook.name = name;
  newBook.situation = true;
  newBook.user = null;
  newBook.borrowedDay = null;
  newBook.paidDay = null;
  newBook.overTime = null;
  data.book.push(newBook);
}

function showCreateUser() {
  var name = readlineSync.question('> The name of user: ');
  var newUser = {};
  newUser.id = data.user.length;
  newUser.name = name;
  newUser.book = [];
  data.user.push(newUser);
}

function showSearchBook() {
  var arrResult = []
  var needSearch = readlineSync.question("> Search: ");
  for (var book of data.book) {
    var resultSearch = book.name.toLowerCase().indexOf(needSearch.toLowerCase());
    if (resultSearch !== -1) {
      arrResult.push([
        book.id,
        book.name,
        book.situation,
        book.user,
        book.borrowedDay,
        book.paidDay,
        book.overTime,
      ]);
    } 
  }
  return arrResult
}

function showSearchUser() {
  var arrResult = [];
  var needSearch = readlineSync.question('> Search: ');
  for (var user of data.user) {
    var resultSearch = user.name.toLowerCase().indexOf(needSearch.toLowerCase());
    if (resultSearch !== -1) {
      arrResult.push([
        user.id,
        user.name,
        user.book
      ]);
    }
  }
  return arrResult;
}

function run() {
  loadDate();
  showMenu();
}

run();