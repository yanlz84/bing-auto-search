// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.36
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
var default_search_words = ["习近平同俄罗斯总统普京举行会谈", "普京：解放军是阅兵规模最大外国军队", "特大暴雨来了", "Citywalk带你探索莫斯科", "中俄签署联合声明", "美国主教普雷沃斯特当选新任教皇", "印度称摧毁巴第二大城市防空系统", "31岁“奶茶妹妹”章泽天晒旅行照", "比尔盖茨：20年内捐出几乎全部财富", "两天两场发布会释放什么信号", "宝宝以为自己的名字叫“小爱同学”", "福建8岁失联男孩已找到？不实", "巴基斯坦空军为何如此强悍", "英美就关税贸易协议条款达成一致", "卫健委发文 大批医院要开设新科室", "印巴爆发冲突后 莫迪首次发声", "赵丽颖称换发色是换个心情", "俄雪地里解放军仪仗队正步声超震撼", "阿莫林：若想跻身决赛仍需竭尽全力", "北上广深宣布下调公积金贷款利率", "中航工业发布歼10C机群高清图", "3岁女童突然脱发 查出铊中毒", "官方回应有人在银行买到掺假金条", "李佳琦回应妈妈带货：她正是拼的年纪", "研究称午睡时长30分钟以内最好", "巴总理：印度战机被我们打成渣了", "重庆大学通报本科生14篇SCI事件", "女子举报丈夫涉嫌重婚 同小区2个家", "西安碑林博物馆门票从10元涨到85元", "柳州吃一碗白粥能吃出国宴的感觉", "福建8岁男童搜寻进入第4天", "大批韩国游客飞江苏盐城打高尔夫", "市监局回应女子公筷试吃咸菜后插回", "网友早高峰偶遇鸵鸟压马路", "泽连斯基称与特朗普通话讨论停火", "詹姆斯：森林狼至少会进西部决赛", "巴总理：本可击落10架以上印战机", "印度称克什米尔遭袭击 巴方否认", "没库里勇士该怎么打", "勇士vs森林狼", "湖南27名学子提前锁定清北", "众泰汽车年销14辆 高管拿百万年薪", "成都新添国产飞机C909执飞航线", "新茶饮赛道起飞 供应链黑马名单曝光", "小里瓦尔多：我有自己的人生", "伦敦股市8日下跌", "达赫迪：奥沙利文输是因不适应新球杆", "北京今日持续降雨局地或现暴雨", "赵心童父母同事：赵父曾任医院副院长", "羽毛球原料涨得比黄金还快", "靳东又有新身份"]

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
