// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.284
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
var default_search_words = ["习近平回信勉励全国特岗教师代表", "苹果的牙膏“挤爆了”", "特朗普回应以军空袭卡塔尔：深感遗憾", "“我是中国老兵 我骄傲！”", "总理辞职政府大楼被烧 尼泊尔怎么了", "83岁博士造自行车 一年卖4.5亿元", "共享单车骑行中突然被锁致多人摔伤", "白宫回应以色列袭击卡塔尔", "中东转折性事件让人倒吸一口凉气", "泡泡玛特全线产品跌价", "刘宇宁登8月沸点榜一！曾演唱会挥泪", "“宁夏多名学生食物中毒”系谣言", "最贵17999！iPhone 17国行版售价公布", "苹果推出手机斜挎挂绳 售价479元", "AirPods Pro 3 支持实时语音翻译", "黄景瑜前妻称孩子被打没了", "小伙两年内中6次彩票奖金超千万", "阅兵观礼座椅去了这些地方", "哈马斯称领导层在以色列袭击中幸存", "动物园幼虎被打头喷水“强迫营业”", "新增橙色配色 iPhone 17 Pro丑吗", "青岛一环卫工将垃圾扫进大海被开除", "苹果发布4款芯片为新机赋能", "一场雷雨后400名患者涌进急诊", "被中方反制的石平 如何沦为当代汉奸", "付费乱讲PPT大赛门票5分钟抢光", "中国足球谣言为何集中爆发", "今日教师节", "苹果推出史上最薄手机iPhone Air", "世界人才排名香港位列亚洲第一", "以色列袭击卡塔尔首都多哈", "iPhone Air真机体验来了 到底有多薄", "舆情通报不能开“空头支票”", "iPhone首现2TB内存", "马克龙任命法国防长担任新总理", "以15架战机袭击哈马斯高层 筹划数月", "以军袭击多哈：爆炸声不断 人群奔逃", "92岁游本昌将进军短剧", "中国约7亿人感染幽门螺旋杆菌", "以军袭击哈马斯高层 油价金价齐涨", "俄外长：谴责西方将波总统撤职的企图", "iPhone 17标准版也配120Hz高刷", "李在明批反华集会：纯属“闹事”", "以军披露袭击卡塔尔详情：已筹划数月", "苹果发布AirPods Pro 3 售价249美元", "干冰放冰箱里炸了：干冰不是冰", "“环保少女”船队遭无人机袭击", "iPhone Air确认支持中国联通eSIM", "中国队晋级U23亚洲杯正赛", "苹果发布三款手表 各有特色", "美股三大指数收涨 苹果收跌1.48%"]

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
