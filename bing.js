// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.332
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
var default_search_words = ["习近平同新加坡总统互致贺电", "河南玉米收获季遇雨 大学生被召回家", "中国已用上“地面空间站”", "“一箭穿云”链动星辰大海", "“毛孩子”或成商场新流量密码", "东北虎“二埋汰”更脏了 园方回应", "又一个美军四星上将辞职", "巴西全球最大“蚊子工厂”准备投产", "“手拿折扇被误会持刀”男子再发声", "“飞行的硫酸”活跃 遇到千万别拍", "哈马斯称同意释放所有以色列人质", "雁门关景区辟谣“游客1死2伤”", "小米回应“小米汽车突然自己开走”", "肯德基保密54年的炸鸡配方将公开", "美媒关注景德镇“鸡排哥”走红", "兵马俑景区只见人头不见俑", "塞尔维亚总统体验中国速度", "武契奇体验中国造铁路：非常出色", "假期医院肛肠科就诊人数激增", "一家三口国庆节开2架飞机回老家", "12306回应女子投诉同车乘客脚臭", "演员江语晨官宣离婚", "“731毒气实验室”玩具已下架", "台风“麦德姆”直扑海南广东", "枣庄辣子鸡月饼火了", "黄磊首次回应未熟豆角食物中毒争议", "孙颖莎王楚钦混双夺冠", "牛弹琴：中东一个重大转折点要来了", "海口4日下午起将实施“六停”", "比赛中球迷大喊 王楚钦林诗栋发声", "德军将成欧洲最强 普京回应耐人寻味", "美国将发行印有特朗普头像的硬币", "以军：已有87万巴勒斯坦人从加沙撤离", "吴克群现身新人婚礼现场唱歌并随礼", "探访特种飞机“海雕”“空中帅府”", "男子拿扇子被误认持刀：遭踹倒送警局", "郑钦文退出武网", "在普吉岛失踪的中国男子已确认遇难", "“全网最爱发钱的老板”又要发红包", "摄影师接下多地新人同日婚单后失联", "俄罗斯积极帮助印度参与北极事务", "中方敦促西方国家取消单边强制措施", "委内瑞拉探测到超5架美国战机", "伊朗救援直升机坠毁 已致2人死亡", "美军打击又一艘疑似贩毒船 击毙四人", "陈幸同半决赛将战孙颖莎", "《天气预报》背景音乐原来是这首名曲", "尧仔炒粉店老板抡铲4小时没停手", "古特雷斯呼吁抓住机遇结束加沙冲突", "杨国强任海南省副省长", "商务部：将密切关注墨方调查进展"]

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
