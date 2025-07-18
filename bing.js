// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.177
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
var default_search_words = ["改革为人民", "饿了么、美团、京东被约谈", "外交部回应李嘉诚卖港口最新消息", "这些录取通知书让人眼前一亮又一亮", "中国乒乓变中国兵乓", "获赔88万拿55万律师：早前仅判赔5万", "深圳机器人已经学会给自己换电池", "女子辱骂吸烟领导被辞 索赔14万被驳", "信用卡还款日还款 6年被收1.2万利息", "歼16飞行员把录取通知书送上门", "日本警方指认中国玩具枪能发射实弹", "青海考生405分被北大录取？假的", "英国诞生8名“三亲婴儿”", "火把节选美 25岁彝族姑娘摘金", "屡发声的宗庆后弟弟曾抄袭AD钙奶", "外卖堂食“双标”乱象", "千年国宝佛头被刻字：测绘局到此古迹", "姚晨素颜看起来好沧桑", "85岁老人用树枝画花惊艳众人", "可口可乐不改 百事可乐：我们可以改", "柬埔寨扫荡电诈园区：大批人员转移", "孙俪悄悄留了长发", "派出所回应暴走团占道逼停救护车", "中国男子泰国遇害 家属曾被勒索66万", "贾跃亭发新车 此前刚获1亿美元融资", "王宁上半年把去年一整年的钱都赚了", "打虎！正部级刘慧被查", "15岁孩子夜游嘉陵江失踪 妈妈急哭", "上海市民吐槽麦当劳成老年棋牌室", "“鸿蒙大酒店”火爆出圈", "高考607分女生高温天帮爸爸装空调", "曝Coldplay演唱会拍到的出轨男道歉", "韩国学霸没偷来试卷后数学考40分", "提前退休18年后副县级干部曾洪被查", "父母送的玩具枪走火致女儿角膜穿孔", "交警回应货车铁钉撒一地多车被扎", "今年蚊子不是变少了只是热“懒”了", "美游客戴金项链在米兰遭割喉抢劫", "女乘客与网约车司机因开空调起争执", "19岁男孩失联已俩月 定位在柬埔寨", "全国公安都在找周杰伦拍反诈视频", "三对双胞胎考上国防科技大学", "当地回应赤脚医生过铁索桥坠亡", "女子长期腰痛一查竟有3个肾", "最严电动自行车国标即将实施", "特朗普身体出问题背后是否还有隐患", "台风“韦帕”最强风力可达14级", "蔚来单方面取消高里程车主权益", "铂爵旅拍“失联” 电话不接拉黑顾客", "男子反复水肿11年后诱发致命病症", "樊振东现身“国球三进”争霸赛"]

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
