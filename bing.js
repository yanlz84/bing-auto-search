// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.201
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
var default_search_words = ["二十届四中全会将于10月在北京召开", "海啸抵达日本：民众挤满屋顶", "山西失联车辆已确认10人遇难", "这些沿海地区注意安全！", "女车主摇中88888车牌 有人出价110万", "中方回应美方威胁对华征更高关税", "潘展乐爆冷无缘100自决赛", "业主曝300多万新房楼梯一踢就碎", "特朗普：我只给俄罗斯10天", "陈佩斯点评儿子连用3个一般", "北京密云洪灾 老人8万现金被冲走", "台风来袭有游客被困在外滩？假", "四川攀枝花发现10多株“冥界之花”", "33岁男星柯炜林确诊肺腺癌晚期", "千岛群岛发生6.0级地震", "直击台风“竹节草”二次登陆", "新东方美股盘前一度跌超11%", "新东方四季度净利润同比减少73.7%", "中交集团被约谈", "台风“竹节草”在上海二次登陆", "金龟子又要当姥姥了", "《蝙蝠侠》演员海滩上去世 享年60岁", "日本已对超200万人发出避难指示", "张碧晨广州站演唱会开票遇冷", "跳操配小龙虾夜宵 女子现“酱油尿”", "#上海要进入台风眼区了#", "#南京照相馆适合小孩看吗#", "今年最热血电影 暴露了上海的另一面", "沙尘暴突袭甘肃：百米高沙墙扑向公路", "手把手教你申领育儿补贴", "贾静雯遇海啸警报：有逃难的感觉", "为何将一孩纳入育儿补贴？官方回应", "女子得荨麻疹能在皮肤划字 医生回应", "金店悬赏每克380元寻被冲走首饰", "俄北库里尔斯克地区进入紧急状态", "男子欠款超千万 法院发229万悬赏", "库克宣布苹果捐款支援中国洪灾灾区", "“特朗普爱上保洁”被曝查无此剧", "河北一草原有游客骑马相撞 一马死亡", "云南一甜品店卖见手青冰淇淋", "2024年中国结婚登记610.6万对", "泰国宣布全国禁飞无人机", "吉克隽逸因瘦不下去崩溃大哭", "加沙50公斤面粉卖7000多元", "傅园慧回应蛙泳教学争议", "潘展乐以为对手抢跳", "男子被骗至缅甸 每天上网装女人电诈", "海啸抵达日本 暂无核设施异常报告", "《南京照相馆》能拯救暑期档吗", "海啸波抵达美国加州", "浙江发布地质灾害红色预警"]

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
