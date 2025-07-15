// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.171
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
var default_search_words = ["走出一条中国特色城市现代化新路子", "上海多人暴雨中排队喝零下80度咖啡", "中方回应美议员威胁对华征500%关税", "半年经济大考成绩单透露哪些信号", "养鹅十多年头一次见鹅热死在水里", "旺仔牛奶出国后变火辣小孩了", "护网2025严守视频会议“安全门”", "3名高中生打工失联 疑被骗至缅北", "广东顺德确诊478例基孔肯雅热", "法国国庆阅兵士兵自己刀自己", "蒋欣吃关晓彤同款“彩椒碗”", "台州一海狮被虐满身伤痕？是肥胖纹", "国足与中国香港队爆发冲突", "亲爸后妈让孩子躺后备箱 亲妈气炸", "山姆上架好丽友被质疑背刺中产", "中方回应英伟达将对华销售H20芯片", "河南82条高温红警生效中 玻璃热炸", "向佐被曝欠赌债未还", "中方回应特朗普威胁对俄征100%关税", "热爆了！全国多地高温破纪录", "神似张柏芝素人女孩否认签于正", "董璇再婚老公疑为演员张维伊", "董璇官宣再婚", "打砸记者摄像机当事人：冲动了", "特朗普发最后通牒 俄罗斯：不在乎", "国足1比0中国香港获东亚杯季军", "《歌手2025》黄丽玲补位 林志炫返场", "山姆APP下架低糖好丽友派", "全国热哭预警地图来了", "华东理工回应将充电宝列入违章电器", "国足东亚杯首球 黄政宇抽射破门", "黄仁勋：将向中国市场销售H20芯片", "董璇：我再婚让佟丽娅又相信爱情了", "48岁知名基金经理李大刚离世", "女子2.5亿存款失踪 银行：储户有过错", "餐馆发蛤蟆汤照拟罚45万 5人被停职", "王楚钦美国大满贯后发文", "18岁高中生坐飞机到西双版纳后失联", "记者调查企业遭阻扰 采访设备被砸碎", "好丽友回应低糖版派脂肪含量增加", "今晚下调油价 加满一箱油少花5元", "特朗普称普京骗了很多美国总统", "陈奕迅回应摔倒：没事 有肉", "男子假扮保安混入王鹤棣活动现场", "昆明机场通报一航班起落架受损", "记者采访时设备被砸碎 中国记协回应", "高温席卷近20省 这些地方热到崩溃", "上半年中国GDP同比增长5.3%", "殡仪馆回应招表演等专业人员：有需要", "杭州地铁一男子爬进车厢吓跑乘客", "特朗普：我老婆暗示我普京不可信"]

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
