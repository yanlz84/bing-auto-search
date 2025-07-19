// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.179
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
var default_search_words = ["习近平同毛里塔尼亚总统互致贺电", "偷渡出境男子：被打七八百棍血流三碗", "周六的免费奶茶没了", "2025三伏天日历请查收", "俄方罕见“完全同意”泽连斯基", "12306回应高铁不要食用方便面提醒", "净网2025：网警打击涉汛网络谣言", "李强宣布雅鲁藏布江下游水电工程开工", "董洁回大连逛夜市 素颜撸串喝扎啤", "机车网红哈雷小姨车祸去世", "越南3名前国家领导人被解除党内职务", "演唱会出轨CEO致歉妻子 马斯克吃瓜", "中央纪委“内鬼”杨青录被查", "杭州余杭区政府致歉", "美国IT大佬出轨被拍 妻子已清空账号", "直击苏超榜首战：南通vs盐城", "被骗至缅甸高考生被好心大哥救助", "饭店老板称不搞“双标”就活不下去", "演唱会亲密搂抱两高管各自有家庭", "六小龄童在景区给“孙悟空”授艺", "一块好丽友砸穿了中产的山姆信仰", "苏超梗最密的周末来了", "马上过期的“红色尖叫”被炒到68元", "特大暴雨雷暴大风 台风韦帕即将登陆", "体育总局：全面纠治“金牌至上”思想", "保时捷掀抢购潮 晚买两天贵十几万", "通报：杭州臭味自来水不是粪水", "上市公司董事长被刑拘 当过副市长", "澳大利亚晋级女篮亚洲杯决赛", "受台风影响 海南将迎强风雨天气", "苏超：泰州vs宿迁", "中国独角兽企业总估值超1.2万亿美元", "入职体检乙肝阳性被公司拒录合理吗", "多方回应香奈儿柜姐与顾客互殴", "104岁老人成苏超球迷", "罕见 北极圈内城市热到了30℃", "女子长期16加8减肥患结石切除胆囊", "黄友政弟弟参加张继科杯夺冠", "外卖“疯狂星期六”不再疯狂", "拿走公司10元不到洗手液该被开除吗", "美媒：特朗普真的不画画吗", "山姆被指只有说英文才有人工客服", "叙利亚政权宣布立即全面停火", "美国这一举动让整个非洲怒了", "郑钦文做右肘微创手术", "未来极端高温或致510万人住院", "男子落水被自家金毛救上岸", "被骗至缅甸高考生已找到：剃了寸头", "体检10年患癌女子：不认可爱康无责", "外卖大战下堂食锐减 餐饮哀歌", "听障司机被女乘客骂 当地残联回应"]

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
