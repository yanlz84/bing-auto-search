// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.133
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["打好禁毒人民战争", "十年前没人敢选的专业居然翻红了", "国防部：美国想把战火引向台湾", "中国何以成为跨国投资热土", "714分考生妈妈查分前梦到考了714分", "王思聪的110万元电视坏了", "高考放榜 网警守护", "哈梅内伊：伊朗给了美国一记耳光", "洪森：泰国总理要换人了", "刘亦菲抹胸长裙造型美得毫不费力", "#暴雨肆虐下的贵州黔东南#", "扁担女孩考527分？班主任辟谣", "压迫感太强 第一视角看缉毒一线", "禁止携带无3C标识充电宝乘坐航班", "姚明易建联后 杨瀚森也被首轮选中", "小米人车家全生态发布会", "最近为啥这么热", "时隔一年半 金正恩妻子李雪主再露面", "地震“干饭小孩哥”：以后不贪吃了", "宋佳白色套装酷飒出席白玉兰", "杨瀚森成中国第三位NBA首轮秀", "女生高考涨了167分被吓到模糊", "国产汽水大窑将被美资收购？公司回应", "男孩高考696分 家里糖水店成网红店", "扁担女孩高考成绩已出", "印巴防长在中国同框", "广州50多人凌晨穿白衣列队街头行走", "原来刘亦菲吃饭也是手机先吃", "小沈阳晒亲吻照纪念结婚21周年", "荔枝60一斤卖给迪拜土豪", "中国球员杨瀚森被NBA开拓者选中", "云南原副省长张祖林贪超1亿被判无期", "杨瀚森成第9位被选中的中国球员", "胡杏儿西装造型爆改微商女强人", "跪谢无腿父亲的男生高考成绩公布", "为什么年轻人不想再等快递", "东北资源枯竭报告", "高校通报“男扮女装替考”：拟开除", "都美竹否认骗钱", "白玉兰颁奖典礼行程图已出", "楼盘被曝用劣质钢筋 工人徒手掰断", "缉毒民警：结了婚有小孩的冲在最前面", "梁实的高考编年史", "救助百名弃婴和尚涉诈骗 警方通报", "海昏侯墓出土钢制医用毫针", "38岁宝妈时隔20年再战高考总分565", "山西一单位有人“1岁工作22岁退休”", "#军警院校有多值得报考#", "龙芯发布国产自研新一代处理器", "91岁游本昌露面大笑称活过来了", "毕业典礼上的小太乙真人"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
