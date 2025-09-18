// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.300
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
var default_search_words = ["扩大高水平开放 拓展发展新空间", "靴子落地 美联储降息25个基点", "“嘎子哥”因穿警服直播带货被拘", "“十四五”期间9家新央企组建设立", "波兰战机保卫领空时导弹误中民宅", "吾辈自强 勿忘九一八！", "美联储降息对我们有啥影响？", "女子结婚请18个“摩友”给自己接亲", "美国宾州爆发大规模枪击事件", "侵华日军罪行再添铁证", "夫妻选车牌 妻子随手摇出6666", "当地辟谣男子因天价彩礼跳河", "电影《731》今日正式上映", "陈好：那么年轻遇到万人迷很幸运", "美联储降息 黄金升破3700美元", "鲍威尔：美联储坚定致力于保持独立性", "教育局回应中学强制女生剪斜面短发", "16国紧急发表联合声明", "中国金龙指数大涨2.8% 百度涨超11%", "“馆长”：广西学生军训比台军演还强", "美联储年内预计再降息2次", "河南一高校喝蜜雪冰城需自带水杯", "NASA称“太阳正逐渐苏醒”", "以色列财长竟笑谈战后如何瓜分加沙", "男子回应将仨娃放地铁口：老婆失联", "终结“九价焦虑”的中国方案来了", "相关部门回应深圳一高速上装喷泉", "车主忘拔油枪 开车就走拽倒加油机", "河南一公职人员在他人耕地屡次修坟", "牛弹琴：这是中东一个历史性的事件", "何雷：大陆不希望有攻台武器装备", "专家提醒：油浸美食别多吃", "男子欠5000多万被抓 家藏茅台鹿鞭", "中国科学家开发出首例氢负离子电池", "每个中国人 铭记这一天", "陕西暴雨 两老人刚出来房子就塌了", "外交部回应迪士尼等起诉中国公司", "曹骏新古装造型像二郎神", "辛芷蕾否认获奖是“弯道超车”", "菲律宾众议长因卷入腐败丑闻辞职", "学校保安打死校园流浪狗？校长回应", "《731》全球首映式观众不停抹泪", "俄军火箭炮轰击100公里外乌军阵地", "特朗普称特别一词不足以形容英美", "中韩外长会谈 韩媒：释放积极信号", "副校长任羽中被查 北京大学表态", "万科组织架构大调整", "过去两天加沙超4万人被迫流离失所", "L2级辅助驾驶迎来强制国标", "迷你拉布布隐藏款二手价跌56%", "海底捞多款儿童套餐标注部分预加工"]

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
