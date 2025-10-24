// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.373
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
var default_search_words = ["党的二十届四中全会公报一图速览", "10月25日设立为台湾光复纪念日", "教育部：严禁将手机带入课堂", "速览“十四五”中国奔跑姿态", "高铁推出17元盒饭：门店现炒", "KK园区超800人逃入泰国", "网警起底无底线博流量网络乱象", "49元买李宁外套收到linimg", "央视公开台湾光复新闻影像", "中方驳斥泽连斯基称中国援助俄罗斯", "南邮又悄悄给学生饭卡充钱了", "河南南阳暴发猪瘟系谣言", "普京宣布提高全日制女学生孕产津贴", "上海51岁丁克立遗嘱 财产留给妻子", "一起看烟花 直击浏阳花炮文化节", "“西安请记住你是西北 不是东北”", "安徽一狮子街头狂奔 有人拿铁锹追", "中央气象台：强冷空气来袭 席卷多地", "年休假能跨年休吗？官方解答来了", "外交部回应中美元首是否将会晤", "明天是第一个台湾光复纪念日", "教育部：不得以考试成绩对学生排名", "MEGA行驶时起火被烧成空架 理想回应", "太阳系迎来第三位“星际访客”", "学校每人收240元电话费 收费超百万", "人民日报点赞“卷尺哥”", "女子靠“代购骗局”赚外快养男友3年", "女子10年前给儿子买三金转手赚20万", "普京呼吁年轻人不要推迟生育", "江苏一地上百人在地里免费捡花生", "健身房3个月减重100斤送帕拉梅拉", "国家烟草专卖局副局长韩占武被免职", "西安连日阴雨市民称古墓变森林", "“感动中国”的江梦南生宝宝了", "医生建议频繁洗澡不如多泡脚", "印流行“爆竹枪” 已致14名儿童失明", "供暖“八仙过海”：有医院提前一个月", "A股收评：沪指涨0.71%续创10年新高", "“业务员”让上千万养老钱打水漂", "“摸金校尉”在村里租房3年秘密寻墓", "李佳琦双11卖的电动牙刷两年前生产", "郑丽文要让国民党羊群变狮群", "中方回应中国内地和印度将恢复直航", "成都一寿司广告被吐槽饭缩力拉满", "辽绥渔35261船倾覆被查处挂牌督办", "美国前珠宝大盗嘲讽卢浮宫劫匪", "中山大学为千对结婚校友发伉俪证", "秋天是变短了吗 冬天会更长吗", "俄称一夜击落111架乌无人机", "中国制造硬核实力再出圈", "双11多个直播间遇退货潮？多方回应"]

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
