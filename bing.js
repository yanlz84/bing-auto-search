// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.68
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
var default_search_words = ["推动精神文明建设展现新气象新作为", "哈佛中国学者：很高兴此时离开美国", "大学生200元的成本干了20亿的项目", "特色产业创新发展蝶变成“金招牌”", "苹果从榜1到榜3只需一个特朗普", "朝鲜驱逐舰下水事故进展：再抓3人", "雨果4-3险胜梁靖崑 将与王楚钦争冠", "叶童将不再参与新白娘子传奇演唱会", "伴郎抢手捧花求婚跪错女友", "连续6任一把手被查 省委书记提要求", "警员视力矫正后因难忍副作用自尽", "叙利亚女孩搭讪中国小伙求娶？假", "10多个省份鼓励实行2.5天休假模式", "特朗普24小时内连砍三刀", "刘浩存体重轻到水量纹丝不动", "王楚钦孙颖莎夺冠后都比了3", "哈佛已离境留学生或无法返美", "上海明确：不得要求家长检查批改作业", "钟南山谈大S离世：很遗憾", "梁靖崑无缘男单决赛 这一幕令人心疼", "央视曝光上门免费服务骗局", "比食堂绞肉机生蛆更让人担心的是啥", "75%在美科学家考虑离开美国", "”中国天眼”发现罕见掩食脉冲星", "全红婵被比赛现场欢呼声吓到捂耳朵", "存款利率0字头时代 钱放哪收益高", "拜登确诊癌症后首次公开露面", "全智贤白色抹胸伞裙", "哈佛禁令引众怒 中国学生不敢离校", "王曼昱横扫陈幸同 与孙颖莎会师决赛", "演员黄兆欣猝死离世 曾与琼瑶合作", "比亚迪宣布22款车型限时降价", "隐翅虫毒液堪比硫酸 千万别拍打", "戛纳闭幕 中国导演毕赣获特别奖", "300万人选出最丑军训服 新生：天塌了", "毕业最后一次听力测试响起《再见》", "杨采钰新恋情曝光", "4名干部收茅台喝茅台被点名", "曹颖发文告别《浪姐》", "武汉女足夺得亚冠冠军", "闭关半年李子柒现身江西", "华人遭抢劫 枪战15分钟击退劫匪", "八旬老人借20万给孙女后诉至法院", "林志炫空档4个月却淘汰 合伙人发声", "是否用了翻译？俄乌突然爆发激烈争吵", "武汉一汽车暴雨中“吃井盖”", "胡彦斌给演唱会每一位观众送金子", "张纪中74岁寿宴上称自己是少年", "美国关税下欧洲多行业恐陷生存危机", "这一刻 全车乘客都是她的家人", "研究发现地核正在泄漏黄金"]

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
