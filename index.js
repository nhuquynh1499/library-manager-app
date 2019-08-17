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
var titleOfColumnList = [['Id', 'The name of Book', 'User', 'Borrowed Day', 'Paid Day', 'Overtime']];
var titleOfColumnBook = [['Id', 'The name of Book', 'Status', 'User']];
var titleOfColumnUser = [['Id', 'The name of User', 'Borrowed Book (name, overtime)']];
var output;

function loadDate() {
  dataFile = fs.readFileSync("./data.json");
  data = JSON.parse(dataFile);
}

function updateOverTime() {
  for (list of data.list) {
    list.overTime = countOverTime(list.borrowedDay, list.paidDay);
    var overTime = list.overTime;
    for (user of data.user) {
      for (item of user.book) {
        if (item.nameBook === list.nameBook)
          item.overTime = overTime;
      }
    }
  }
}

function showMenu() {
  console.log("0. Show all list of library.")
  console.log("1. Show all books");
  console.log("2. Show all user");
  console.log("3. Create a book");
  console.log("4. Create a user");
  console.log("5. Search a book");
  console.log("6. Search a user");
  console.log("7. Borrow a book");
  console.log("8. Pay a book");
  console.log("9. Delete a book");
  console.log("10. Delete a user");
  console.log("11. Save and Exit");
  var option = readlineSync.question("> ");
  switch (option) {
    case '0':
      showAllList();
      showMenu();
      break;
    case '1':
      showAllBooks();
      showMenu();
      break;
    case '2':
      showAllUser();
      showMenu();
      break;
    case '3':
      showCreateBook();
      showMenu();
      break;
    case '4':
      var name = readlineSync.question('> The name of user: ');
      var overTime = null
      showCreateUser(name, "", overTime);
      showMenu();
      break;
    case '5':
      var result = showSearchBook();
      if (result !== []) {
        output = table(titleOfColumnBook.concat(result));
        console.log(output);
      } else {
        console.log('No book');
      }
      showMenu();
      break;
    case '6':
      var result = showSearchUser();
      if (result !== []) {
        output = table(titleOfColumnUser.concat(result));
        console.log(output);
      } else {
        console.log('No user');
      }
      showMenu();
      break;
    case '7':
      showBorrowBook();
      showMenu();
      break;
    case '8':
      showPayBook();
      showMenu();
      break;
    case '9':
      showDeleteBook();
      showMenu();
      break;
    case '10':
      showDeleteUser();
      showMenu();
      break;
    case '11':
      saveAndExit()
      break;
    default:
      console.log('Option wrong');
      showMenu();
      break;
  }
}

function showAllList() {
  var list = [];
  for (var item of data.list) {
    list.push([
      item.id,
      item.nameBook,
      item.user,
      item.borrowedDay,
      item.paidDay,
      item.overTime,
    ]);
  }
  output = table(titleOfColumnList.concat(list));
  console.log(output);
}

function showAllBooks() {
  var list = [];
  for (var book of data.book) {
    list.push([
      book.id,
      book.nameBook,
      book.status,
      book.user,
    ]);
  }
  output = table(titleOfColumnBook.concat(list));
  console.log(output);
}

function showAllUser() {
  var list = [];
  var count = 0;
  for (var user of data.user) {
    var infoBorrowedBook = []
    if (user.book !== []) {
      for (var itemBook of user.book) {
        var valueOfInfoBook = itemBook;
        for (var key in valueOfInfoBook) {
          infoBorrowedBook.push(valueOfInfoBook[key]);
        }
      }
    }
    list.push([
      user.id,
      user.userName,
      infoBorrowedBook
    ]);
  }
  output = table(titleOfColumnUser.concat(list));
  console.log(output);
}

function showCreateList(book, user) {
  var newItem = {};
  newItem.id = data.list.length;
  newItem.nameBook = UpperCaseFirst(book);
  newItem.user = UpperCaseFirst(user);
  newItem.borrowedDay = new Date(Date.now());
  newItem.paidDay = null;
  newItem.overTime = countOverTime(newItem.borrowedDay.getTime(), null);
  data.list.push(newItem);
};

function showCreateBook() {
  var name = UpperCaseFirst(readlineSync.question('> The name of book: '));
  var newBook = {};
  newBook.id = data.book.length;
  newBook.nameBook = name;
  newBook.status = true;
  newBook.user = null;
  data.book.push(newBook);
}

function showCreateUser(userName, nameBook, overTime) {
  var newUser = {};
  newUser.id = data.user.length;
  newUser.userName = UpperCaseFirst(userName);
  //newUser.book = [{ "nameBook": nameBook, "overTime": overTime }];
  if (nameBook !== "") {
    newUser.book = [{ nameBook: nameBook, overTime: overTime }];
  } else {
    newUser.book = [];
  }
  data.user.push(newUser);
}

function showSearchBook() {
  var arrResult = []
  var needSearch = UpperCaseFirst(readlineSync.question("> Search: "));
  for (var book of data.book) {
    var resultSearch = UpperCaseFirst(book.nameBook).indexOf(needSearch);
    if (resultSearch !== -1) {
      arrResult.push([
        book.id,
        UpperCaseFirst(book.nameBook),
        book.status,
        book.user,
      ]);
    } 
  }
  return arrResult
}

function showSearchUser() {
  var arrResult = [];
  var count = 0;
  var needSearch = UpperCaseFirst(readlineSync.question('> Search: '));
  for (var user of data.user) {
    var resultSearch = UpperCaseFirst(user.userName).indexOf(needSearch);
    if (resultSearch !== -1) {
      var infoBorrowedBook = [];
      var valueOfInfoBook = user.book[count++];
      for (var key in valueOfInfoBook) {
        infoBorrowedBook.push(valueOfInfoBook[key]);
      }
      arrResult.push([
        user.id,
        UpperCaseFirst(user.userName),
        infoBorrowedBook,
      ]);
    }
  }
  return arrResult;
}

function showDeleteBook() {
  var needDelete = showSearchBook();
  if (needDelete !== []) {
    output = table(titleOfColumnBook.concat(needDelete));
    console.log(output);
    var choice = readlineSync.question("Do you delete the book? (Y/N)");
    if (choice === "N") {
      return -1;
    } else {
      for (var book of data.book)
        for (var item of needDelete)
          if (book.id == item[0])
            if (book.status === true) {
              data.book.splice(data.book.indexOf(book), 1);
              console.log("Deleted.");
            } else {
              console.log("The book has been borrowed. Don't delete");
            }
    }
  } else {
    console.log('No book');
  }
}

function showDeleteUser() {
  var needDelete = showSearchUser();
  if (needDelete !== []) {
    output = table(titleOfColumnUser.concat(needDelete));
    console.log(output);
    var choice = readlineSync.question('Do you delete the user? (Y/N)');
    if (choice === 'N') {
      return -1;
    } else {
      for (var user of data.user)
        for (var item of needDelete)
          if (user.id == item[0])
            if (user.book !== []) {
              data.user.splice(data.user.indexOf(user), 1);
              console.log('Deleted.');
            } else {
              console.log("User has borrowed a book. Don't delete.");
            }
    }
  } else {
    console.log('No user');
  }
}

function showBorrowBook() {
  var needBorrow = showSearchBook();
  if (needBorrow !== []) {
    output = table(titleOfColumnBook.concat(needBorrow));
    console.log(output);
    var choice = readlineSync.question('Do you want to borrow this book? (Y/N)');
    if (choice === 'N') {
      return -1;
    } else {
      for (var book of data.book)
        for (var item of needBorrow)
          if (book.id == item[0])
            if (book.status === true) {
              book.status = false;
              var infoOfUser = UpperCaseFirst(readlineSync.question("Input borrower's name: "));
              book.user = infoOfUser;
              showCreateList(item[1], infoOfUser);
              // // var result = 0;
              for (var list of data.list) {
                if (list.user === infoOfUser) {
                  var overTime = list.overTime;
                }
              }
              var count = 0;
              for (var user of data.user) {
                if (user.userName == infoOfUser) {
                  count++;
                  infoBook = { nameBook: item[1], overTime: overTime };
                  createBookintoUser(user.id, infoBook);
                }
              }
              if (count === 0) {
                showCreateUser(infoOfUser, item[1], overTime);
              }
            } else {
              console.log("The book has been borrowed.");
            };
    }
  } else {
    console.log("No book");
  }
} 

function showPayBook() {
  var needPay = showSearchBook();
  if (needPay !== []) {
    output = table(titleOfColumnBook.concat(needPay));
    console.log(output);
    var choice = readlineSync.question('Do you want to pay this book? (Y/N)');
    if (choice === 'N') {
      return -1;
    } else {
      for (item of needPay) {
        console.log(item);
        if (item[2] !== true) {
          for (book of data.book) {
            if (book.nameBook === item[1]) {
              book.status = true;
              book.user = null;
              for (list of data.list) {
                if (list.nameBook === item[1]) {
                  payAList(list.id);
                }
              }
            }
          }
        } else {
          console.log("The book hasn't been borrowed");
        }
      }
    }
  } else {
    console.log("No book");
  }
}

function saveAndExit() {
  var resultData = JSON.stringify(data);
  fs.writeFileSync('./data.json', resultData);
}

function payAList(id) {
  data.list[id].paidDay = new Date(Date.now());
  data.list[id].overTime = countOverTime(data.list[id].borrowedDay, data.list[id].paidDay.getTime());
}

function createBookintoUser(id, book) {
  console.log(data.user[id]);
  data.user[id].book.push(book);
}

function countOverTime(timeBorrow, timePaid) {
  var borrowDay = new Date(timeBorrow);
  var result;
  if (timePaid === null) {
    var countOfDay = Math.floor((Date.now() - borrowDay.getTime()) / (24 * 60 * 60 * 1000));
    if (countOfDay > 30) {
      result = countOfDay - 30;
    } else {
      result = false;
    }
  } else {
    var paidDay = new Date(timePaid);
    var countOfDay = Math.floor((paidDay.getTime() - borrowDay.getTime()) / (24 * 60 * 60 * 1000));
    if (countOfDay > 30) {
      result = countOfDay - 30;
    } else {
      result = false;
    }
  }
  return result;
}

function UpperCaseFirst(string) {
  return string.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function run() {
  loadDate();
  updateOverTime();
  showMenu();
}

run();


