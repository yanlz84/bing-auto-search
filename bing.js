// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.11
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
var default_search_words = ["为什么中国意味着确定性未来性", "伊朗一港口发生高强度爆炸", "多地宣布发钱奖励结婚", "加关税降逆差为啥走不通", "五一大量外国人涌入中国", "山东一服务区现“沉睡5年”外地车辆", "俄方称已收复库尔斯克 普京表态", "拆二代败光5套房近4000万成阶下囚", "林志玲真的不会老吗", "泽连斯基公布与特朗普会晤细节", "蔡正元回应戴脚镣后是否还会上节目", "苏州港堆满集装箱不发货？假", "伊朗港口爆炸瞬间画面曝光", "降雪致40余辆车被困 交警连夜救援", "蔡徐坤直播突然被封", "贾跃亭：希望FF成功后还债回国", "青岛俱乐部支持杨瀚森参加NBA选秀", "北京国际电影节闭幕红毯", "家属称溺水“美人鱼”仍在ICU", "马斯克100天内砍掉自己1500亿身家", "四川甘孜州白玉县4.9级地震", "女子跳伞落到江上大桥 车辆紧急避让", "47岁刘烨“瘦到皮包骨”引热议", "詹姆斯：东契奇生病是重大打击", "吴艳妮亲手教粉丝调整拍照角度", "驻美使馆：中美未就关税问题进行谈判", "谢霆锋演唱会上被保安摸屁股", "第20届华表奖阵容官宣", "全面取消“仅退款”意味着什么", "今年首个台风“蝴蝶”或将生成", "“方便门”毁了数万跑者的盛大赛事", "台名嘴自曝被戴电子脚镣不能出境", "偶遇那英宋丹丹一起逛商场", "男子为亡妻殉情希望合葬 岳母发声", "U16国少队0比3不敌荷兰", "CBA半决赛打响", "李兆基公祭仪式下周一举行", "章子怡张雪迎素颜合照", "马斯克美财长大吵：胸口相抵狂飙脏话", "百亿补贴商家承担50%？京东外卖回应", "赴港旅客带超19支烟将罚5000港元", "特警队食堂阿姨轻松爬绳惊呆众人", "张杰演唱会安保小哥忘情合唱", "广厦队主帅：杨鸣带队三连冠很牛", "央视曝光假非遗传承人是AI生成", "王俊凯将出席第二十届华表奖", "中国篮协公布外籍裁判名单", "导演被《五哈》兄弟情整哭了", "杨迪回应疑似在南京当小时工", "俄军高官在汽车爆炸中身亡", "夫妻在院子里秀恩爱结果凳子碎了"]

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
