// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.58
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
var default_search_words = ["高质量完成十五五规划编制工作", "新冠病毒抬头？钟南山发声", "国际乒联回应王楚钦球拍受损", "“端午经济”激发消费新潜力", "小伙一年卖出255辆宝马年收入71万", "多家大行下调存款利率 1年期下破1%", "学生靠老干妈下饭 职工餐又多又好？", "凤阳鼓楼疑坍塌 去年刚花340万维修", "过去一夜3个电话 俄乌停火还有多远", "为救孙砍伤醉汉老人申请国赔128万", "两女子偷杏被抓反责备老板小气", "如何辨别AI生成的图片文字声音", "货车司机深夜下车睡觉被狼咬伤", "​​​王楚钦孙颖莎直接晋级混双八强", "虞书欣父亲否认侵吞国有资产15亿", "陈奕迅晒照报平安：复活后先吃肉", "拜登患癌遭质疑：怎么可能刚发现", "中国工商银行下调人民币存款利率", "王楚钦回应换球拍", "孙杨说自己5年没碰过200自", "本轮巴以冲突已致加沙53486人死亡", "美俄元首通话细节：2人都不愿挂电话", "写字楼投票决定夏季不开中央空调", "贪2.61亿！落马正部韩勇被判死缓", "外交部回应巴基斯坦外长访华", "S妈让汪小菲夫妇卖车拿钱", "肖战解读藏海角色", "母子大闹机场不该由社会买单", "以军称人道主义援助物资已运入加沙", "赖清德倒行逆施的“三宗罪”", "曝黄杨钿甜爸爸刚从一生物公司退出", "王楚钦球拍为何接连出问题", "胡塞宣布对以色列海法港海上封锁", "肖战《藏海传》登上世界趋势榜单", "郭焱还原王楚钦球拍受损过程", "医美巨头炮轰券商“玻尿酸过时”论", "菲总统马科斯：愿与杜特尔特家族和解", "塔克拉玛干沙漠10万株玫瑰惊艳绽放", "一季度减税降费及退税超4000亿元", "潘展乐赛后拥抱孙杨", "普京称愿与乌方共同起草和平备忘录", "特朗普：俄乌将立即开始停火谈判", "王艺迪4-0战胜王艾米晋级32强", "胖东来多位高管和员工发声", "孙颖莎4比0胜朝鲜选手晋级32强", "4月70城房价出炉", "丁俊晖：不希望体育圈盛行饭圈文化", "中国芯片迎来“关键一天”", "《藏海传》热度低 肖战下凡救场", "王楚钦孙颖莎晋级世乒赛混双16强", "环球音乐辟谣陈奕迅去世"]

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
